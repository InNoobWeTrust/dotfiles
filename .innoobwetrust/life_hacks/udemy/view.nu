#!/usr/bin/env nu

def main [startFrom: int = 0, f: string = 'links.txt', n: int = 25, browser: string = 'firefox'] {
	if ($f | path exists) {} else { cat *.resolved.txt | lines | save $f }
	let len = (open $f | lines | length)
	let end = ($len / $n | math floor)
	let r = (0..$end | each { |step|
		$step *  $n
	})
	for $s in $r {
    if $s < $startFrom { continue }

		let e = ($s + $n - 1)
		print -n $s ~ $e "\n"
		let links = (open $f | lines | range $s..$e)
		print $links
		input --suppress-output
		$links | ^open -a $browser $in
	}
}
