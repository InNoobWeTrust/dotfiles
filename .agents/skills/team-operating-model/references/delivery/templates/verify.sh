#!/usr/bin/env bash
set -euo pipefail

# Machine-gate TEMPLATE, not an executor or release controller.
# Configure commands, real proof parsing, and known candidate failure codes.
# Run inside the authorized sandbox with an external watchdog. Never use login shells.
VERIFY_READY=${VERIFY_READY:-false}
MACHINE_VERIFIABLE=${MACHINE_VERIFIABLE:-true}
TYPECHECK_CMD=${TYPECHECK_CMD:-}
TEST_CMD=${TEST_CMD:-}
EXTRA_CHECK_CMD=${EXTRA_CHECK_CMD:-}
TYPECHECK_FAILURE_EXIT=${TYPECHECK_FAILURE_EXIT:-}
TEST_FAILURE_EXIT=${TEST_FAILURE_EXIT:-}
EXTRA_FAILURE_EXIT=${EXTRA_FAILURE_EXIT:-}
POSITIVE_PROOF_REGEX=${POSITIVE_PROOF_REGEX:-'([1-9][0-9]*) (tests?|specs?) passed'}
SUMMARY_FILE=${SUMMARY_FILE:-.ralph-verify.json}

typecheck_status=unverified
tests_status=unverified
extra_status=not-required
tests_ran=0
scratch=$(mktemp -d "${TMPDIR:-/tmp}/bounded-verify.XXXXXX") || exit 3
summary_tmp=""
cleanup() {
  rm -f "$scratch/typecheck.log" "$scratch/tests.log" "$scratch/extra.log"
  [[ -z "$summary_tmp" ]] || rm -f "$summary_tmp"
  rmdir "$scratch"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

# All JSON strings below are controlled identifiers, never raw command output.
# The outer controller binds this receipt to run/contract/artifact identity and reviews.
finish() {
  local code="$1" fingerprint="$2" status=error retryable=false
  case "$code" in
    0) status=pass ;;
    2) status=fail; retryable=true ;;
    4) status=unverified ;;
  esac
  summary_tmp=$(mktemp "${SUMMARY_FILE}.tmp.XXXXXX") || exit 3
  cat >"$summary_tmp" <<EOF
{
  "gate": "machine",
  "status": "$status",
  "retryable": $retryable,
  "checks": [
    {"name": "typecheck", "status": "$typecheck_status"},
    {"name": "tests", "status": "$tests_status"},
    {"name": "extra", "status": "$extra_status"}
  ],
  "proof": {"tests_ran": $tests_ran, "typecheck_passed": $([[ "$typecheck_status" == pass ]] && printf true || printf false)},
  "failure_fingerprint": "$fingerprint",
  "release_ready": false,
  "notes": ["machine gate only; controller must validate freshness and release evidence"]
}
EOF
  mv -f "$summary_tmp" "$SUMMARY_FILE" || exit 3
  summary_tmp=""
  exit "$code"
}

[[ "$VERIFY_READY" == true ]] || finish 3 verifier-not-ready
case "$MACHINE_VERIFIABLE" in
  true) ;;
  false) finish 4 not-machine-verifiable ;;
  *) finish 3 invalid-machine-verifiable ;;
esac
[[ -n "$TYPECHECK_CMD" && -n "$TEST_CMD" ]] || finish 3 missing-check-command

# Unclassified failures are broken/untrusted verification, not product retries.
# Empty means no known candidate-failure code. Adapt infrastructure detection per runner.
for candidate_exit in "$TYPECHECK_FAILURE_EXIT" "$TEST_FAILURE_EXIT" "$EXTRA_FAILURE_EXIT"; do
  if [[ -n "$candidate_exit" ]]; then
    [[ "$candidate_exit" =~ ^[1-9][0-9]{0,2}$ ]] || finish 3 invalid-candidate-exit
    [[ "$candidate_exit" -lt 124 ]] || finish 3 invalid-candidate-exit
  fi
done

run_check() {
  local name="$1" command="$2" candidate_exit="$3" rc
  if bash -c "$command" >"$scratch/$name.log" 2>&1; then
    cat "$scratch/$name.log"
    return 0
  else
    rc=$?
  fi
  cat "$scratch/$name.log"
  case "$name" in
    typecheck) typecheck_status=fail ;;
    tests) tests_status=fail ;;
    extra) extra_status=fail ;;
  esac
  if [[ -n "$candidate_exit" && "$rc" -eq "$candidate_exit" ]]; then
    finish 2 "$name-candidate-failure"
  fi
  finish 3 "$name-execution-error"
}

run_check typecheck "$TYPECHECK_CMD" "$TYPECHECK_FAILURE_EXIT"
typecheck_status=pass
run_check tests "$TEST_CMD" "$TEST_FAILURE_EXIT"
test_output=$(cat "$scratch/tests.log")
if [[ "$test_output" =~ $POSITIVE_PROOF_REGEX ]]; then
  tests_ran=${BASH_REMATCH[1]:-0}
  [[ "$tests_ran" =~ ^[1-9][0-9]{0,8}$ ]] || finish 3 invalid-test-count
  tests_status=pass
else
  match_exit=$?
  [[ "$match_exit" -ne 2 ]] || finish 3 invalid-proof-regex
  finish 4 tests-no-positive-proof
fi

if [[ -n "$EXTRA_CHECK_CMD" ]]; then
  extra_status=unverified
  run_check extra "$EXTRA_CHECK_CMD" "$EXTRA_FAILURE_EXIT"
  extra_status=pass
fi
finish 0 ""
