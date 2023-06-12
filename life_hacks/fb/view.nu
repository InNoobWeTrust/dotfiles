#!/usr/bin/env nu

def main [f: string = 'links.txt', n: int = 10, browser: string = 'microsoft edge'] {
	let len = (open $f | lines | length)
	let end = ($len / $n | math floor)
	let r = (0..$end | each { |step|
		$step *  $n
	})
	for $i in $r {
		let e = ($i + $n - 1)
		print -n $i ~ $e "\n"
		let links = (open $f | lines | range $i..$e)
		print $links
		input --suppress-output
		$links | ^open -a $browser $in
	}
}
