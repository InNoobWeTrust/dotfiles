#!/usr/bin/env bash
set -euo pipefail

# Template verifier for Ralph.
# Customize the commands and proof checks for your project before using AFK mode.

TYPECHECK_CMD=${TYPECHECK_CMD:-"npm run typecheck"}
TEST_CMD=${TEST_CMD:-"npm test"}
EXTRA_CHECK_CMD=${EXTRA_CHECK_CMD:-":"}
POSITIVE_PROOF_REGEX=${POSITIVE_PROOF_REGEX:-"([1-9][0-9]*) (tests?|specs?) passed"}
SUMMARY_FILE=${SUMMARY_FILE:-".ralph-verify.json"}
VERIFY_READY=${VERIFY_READY:-true}
MACHINE_VERIFIABLE=${MACHINE_VERIFIABLE:-true}

if [[ "$VERIFY_READY" != true ]]; then
  cat >"$SUMMARY_FILE" <<EOF
{
  "status": "error",
  "retryable": false,
  "checks": [],
  "proof": {
    "tests_ran": 0,
    "typecheck_passed": false
  },
  "failure_fingerprint": "verifier-not-ready",
  "notes": ["customize verify.sh before using AFK mode"]
}
EOF
  exit 3
fi

if [[ "$MACHINE_VERIFIABLE" != true ]]; then
  cat >"$SUMMARY_FILE" <<EOF
{
  "status": "error",
  "retryable": false,
  "checks": [],
  "proof": {
    "tests_ran": 0,
    "typecheck_passed": false
  },
  "failure_fingerprint": "not-machine-verifiable",
  "notes": ["mark the task machine-verifiable before using AFK mode"]
}
EOF
  exit 4
fi

status="pass"
retryable=false
failure_fingerprint=""
typecheck_passed=false
tests_passed=false
extra_check_passed=true
tests_ran=0
test_proof=""
notes=()

run_check() {
  local name="$1"
  local command="$2"
  local output_file
  output_file=$(mktemp)

  if bash -lc "$command" >"$output_file" 2>&1; then
    cat "$output_file"
    rm -f "$output_file"
    return 0
  fi

  cat "$output_file"
  failure_fingerprint="$name"
  status="fail"
  retryable=true
  rm -f "$output_file"
  return 1
}

if run_check "typecheck" "$TYPECHECK_CMD"; then
  typecheck_passed=true
fi

test_output=$(mktemp)
if bash -lc "$TEST_CMD" >"$test_output" 2>&1; then
  cat "$test_output"
  if [[ $(cat "$test_output") =~ $POSITIVE_PROOF_REGEX ]]; then
    tests_passed=true
    tests_ran="${BASH_REMATCH[1]}"
    test_proof="${BASH_REMATCH[0]}"
  else
    status="fail"
    retryable=true
    failure_fingerprint="tests-no-positive-proof"
    notes+=("test command succeeded but did not emit positive proof")
  fi
else
  cat "$test_output"
  status="fail"
  retryable=true
  failure_fingerprint="tests"
fi
rm -f "$test_output"

if ! bash -lc "$EXTRA_CHECK_CMD"; then
  status="fail"
  retryable=true
  extra_check_passed=false
  failure_fingerprint="extra-check"
fi

if [[ "$typecheck_passed" != true ]]; then
  status="fail"
  retryable=true
  failure_fingerprint="typecheck"
fi

if [[ "$status" == "pass" && "$tests_ran" -eq 0 ]]; then
  status="fail"
  retryable=true
  tests_passed=false
  failure_fingerprint="zero-tests"
  notes+=("verification requires at least one test to run")
fi

notes_json="[]"
if [ "${#notes[@]}" -gt 0 ]; then
  notes_json=$(printf '"%s",' "${notes[@]}" | sed 's/,$//')
  notes_json="[$notes_json]"
fi

cat >"$SUMMARY_FILE" <<EOF
{
  "status": "$status",
  "retryable": $retryable,
  "checks": [
    {
      "name": "typecheck",
      "status": "$( [[ "$typecheck_passed" == true ]] && printf pass || printf fail )",
      "proof": "$( [[ "$typecheck_passed" == true ]] && printf 'typecheck completed with 0 errors' || printf '' )"
    },
    {
      "name": "tests",
      "status": "$( [[ "$tests_passed" == true ]] && printf pass || printf fail )",
      "proof": "$test_proof"
    },
    {
      "name": "extra-check",
      "status": "$( [[ "$extra_check_passed" == true ]] && printf pass || printf fail )",
      "proof": "$( [[ "$extra_check_passed" == true ]] && printf 'extra checks passed' || printf '' )"
    }
  ],
  "proof": {
    "tests_ran": $tests_ran,
    "typecheck_passed": $typecheck_passed
  },
  "failure_fingerprint": "$failure_fingerprint",
  "notes": $notes_json
}
EOF

case "$status" in
  pass) exit 0 ;;
  fail) exit 2 ;;
  *) exit 3 ;;
esac
