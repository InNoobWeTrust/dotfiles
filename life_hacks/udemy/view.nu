#!/usr/bin/env nu

def main [f: string = 'links.txt', n: int = 25] {
	cat *.resolved.txt | save -f $f
	let len = (open $f | lines | length)
	let end = ($len / $n | math floor)
	let r = (0..$end | each { |step|
		$step *  $n
	})
	for $i in $r {
		let s = ($i + 1)
		let e = ($s + $n - 1)
		print -n $s ~ $e "\n"
		let links = (open $f | lines | range $s..$e)
		print $links
		input --suppress-output
		$links | ^open $in
	}
}
