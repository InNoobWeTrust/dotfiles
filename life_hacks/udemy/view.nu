#!/usr/bin/env nu

def main [f: string = 'links.txt', n: int = 25] {
	if ($f | path exists) {} else { cat *.resolved.txt | tee $f }
	let len = (open $f | lines | length)
	let end = ($len / $n | math floor)
	let r = (0..$end | each { |step|
		$step *  $n
	})
	for $s in $r {
		let e = ($s + $n - 1)
		print -n $s ~ $e "\n"
		let links = (open $f | lines | range $s..$e)
		print $links
		input --suppress-output
		$links | ^open $in
	}
}
