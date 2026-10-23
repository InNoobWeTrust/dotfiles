#!/bin/sh
# Preview/prune missing-source Stow links; bootstrap calls --apply before Stow.
if ! command -v perl >/dev/null 2>&1; then
    echo "stow-prune: host Perl is required (an isolated Pixi Stow is not enough)." >&2
    exit 1
fi
exec perl - "$@" <<'PERL'
use strict;
use warnings;
use Cwd qw(abs_path);
use File::Spec;
use File::Basename qw(dirname);
use Fcntl qw(S_ISDIR S_ISLNK);
use Errno qw(ENOENT);
use Getopt::Long qw(GetOptions Configure);

my ($source, $target, $apply, $help);
my (@roots, @cli_ignores, $path_ignore, $segment_ignore);
my (%seen, @plan, $removed);
$removed = 0;

sub quoted {
    my ($text) = @_;
    $text =~ s/([\\"])/\\$1/g;
    $text =~ s/\n/\\n/g;
    $text =~ s/([\x00-\x1f\x7f])/sprintf('\\x%02x', ord($1))/ge;
    return qq{"$text"};
}

sub metadata {
    my ($path) = @_;
    my @st = lstat($path);
    return \@st if @st;
    return undef if $! == ENOENT;
    die 'cannot inspect ' . quoted($path) . ": $!\n";
}

sub entries {
    my ($path) = @_;
    opendir(my $dir, $path) or die 'cannot read ' . quoted($path) . ": $!\n";
    my @names;
    $! = 0;
    while (defined(my $name = readdir($dir))) {
        push @names, $name unless $name eq '.' || $name eq '..';
    }
    my $error = "$!";
    my $failed = 0 + $!;
    closedir($dir) or die "cannot close directory: $!\n";
    die "cannot enumerate directory: $error\n" if $failed;
    return sort @names;
}

sub lines {
    my ($path) = @_;
    -f $path or die 'ignore policy is not a readable regular file: ' . quoted($path) . "\n";
    open(my $fh, '<', $path) or die 'cannot read policy ' . quoted($path) . ": $!\n";
    my @lines = <$fh>;
    close($fh) or die "cannot close policy: $!\n";
    chomp @lines;
    return @lines;
}

sub compile_regex {
    my ($text) = @_;
    my $regex = eval { qr/$text/ };
    die "invalid ignore regex: $@" if $@;
    return $regex;
}

sub load_ignores {
    my $cli = "$source/.stow-ignore";
    for my $line (metadata($cli) ? lines($cli) : ()) {
        next if $line eq '' || $line =~ /^#/;
        push @cli_ignores, compile_regex("($line)\\z");
    }
    push @cli_ignores, compile_regex(q{(\.pixi)\z});
    my @patterns;
    if (metadata("$source/.stow-local-ignore")) {
        @patterns = lines("$source/.stow-local-ignore");
    } elsif (defined($ENV{HOME}) && metadata("$ENV{HOME}/.stow-global-ignore")) {
        @patterns = lines("$ENV{HOME}/.stow-global-ignore");
    } else {
        # GNU Stow's default ignore list (2.4.1); local/global policies replace it.
        @patterns = (q{RCS}, q{.+,v}, q{CVS}, q{\.\#.+}, q{\.cvsignore},
            q{\.svn}, q{_darcs}, q{\.hg}, q{\.git}, q{\.gitignore},
            q{\.gitmodules}, q{.+~}, q{\#.*\#}, q{^/README.*},
            q{^/LICENSE.*}, q{^/COPYING});
    }
    my (@paths, @segments);
    for (@patterns) {
        s/^\s+//; s/\s+$//;
        next if /^#/ || !length;
        s/\s+#.+//; s/\\#/#/g;
        push @{index($_, '/') < 0 ? \@segments : \@paths}, $_;
    }
    push @paths, q{^/\.stow-local-ignore$};
    $path_ignore = compile_regex('(^|/)(' . join('|', @paths) . ')(/|$)') if @paths;
    $segment_ignore = compile_regex('^(' . join('|', @segments) . ')$') if @segments;
}

sub ignored {
    my ($path) = @_;
    return 1 if grep { $path =~ $_ } @cli_ignores;
    return 1 if defined($path_ignore) && "/$path" =~ $path_ignore;
    (my $leaf = $path) =~ s!.*/!!;
    return defined($segment_ignore) && $leaf =~ $segment_ignore;
}

sub dotname {
    my ($name) = @_;
    $name =~ s/^dot-/./;
    die "unsafe dotfile name\n" if $name eq '.' || $name eq '..';
    return $name;
}

sub source_ignored {
    my ($relative) = @_;
    my @parent;
    for my $leaf (split m{/}, $relative) {
        # Stow checks the raw leaf BEFORE adjusting it, under the adjusted parent.
        return 1 if ignored(join('/', @parent, $leaf));
        push @parent, dotname($leaf);
    }
    return 0;
}

sub prune_directory {
    my ($relative) = @_;
    my @parent;
    for my $leaf (split m{/}, $relative) {
        return 1 if ignored(join('/', @parent, $leaf));
        # Unknown vanished source spelling: preserve either possible dot-name branch.
        return 1 if $leaf =~ /^\.(.+)/ && ignored(join('/', @parent, "dot-$1"));
        push @parent, $leaf;
    }
    return 0;
}

# Resolve lexically only through real ancestors. Symlink aliases, and '..' after
# a missing component, are uncertain rather than proof of repository ownership.
sub direct_destination {
    my ($parent, $raw) = @_;
    my $path = File::Spec->file_name_is_absolute($raw) ? $raw : "$parent/$raw";
    my (@parts, $missing);
    for my $part (split m{/+}, $path) {
        next if $part eq '';
        if ($part eq '.' || $part eq '..') {
            return undef if $missing;
            pop @parts if $part eq '..';
            next;
        }
        push @parts, $part;
        my $st = metadata('/' . join('/', @parts));
        return undef if $st && S_ISLNK($st->[2]);
        $missing = 1 unless $st;
    }
    return '/' . join('/', @parts);
}

sub candidate {
    my ($path) = @_;
    my $st = metadata($path);
    return undef unless $st && S_ISLNK($st->[2]);
    my $parent = dirname($path);
    my $real_parent = abs_path($parent);
    die "target parent changed or is an alias\n" unless defined($real_parent) && $real_parent eq $parent;
    my $raw = readlink($path);
    defined($raw) or die "cannot read link: $!\n";
    my $dest = direct_destination($parent, $raw);
    return undef unless defined($dest) && index($dest, "$source/") == 0;
    my $relative = substr($dest, length($source) + 1);
    my $mapped = join('/', map { dotname($_) } split m{/}, $relative);
    return undef unless "$target/$mapped" eq $path;
    return undef if source_ignored($relative) || metadata($dest);
    my @followed = stat($path);
    return undef if @followed;
    die "cannot establish dangling link: $!\n" unless $! == ENOENT;
    my $pst = metadata($parent);
    return { path => $path, raw => $raw,
        identity => join(':', @$st[0,1,2], @$pst[0,1]) };
}

sub scan {
    my ($path, $relative) = @_;
    return if $seen{$path}++;
    return if $path eq $source || index($path, "$source/") == 0;
    my $st = metadata($path);
    return unless $st;
    if (S_ISLNK($st->[2])) {
        my $item = candidate($path);
        push @plan, $item if $item;
    } elsif (S_ISDIR($st->[2]) && !prune_directory($relative)) {
        # Nested TARGET directories may outlive their source dirs after a checkout.
        scan("$path/$_", "$relative/$_") for entries($path);
    }
}

sub main {
    for my $i (0 .. $#ARGV) {
        if ($ARGV[$i] =~ /^--(?:source|target|root)$/) {
            die "missing option value; use --help\n" if $i == $#ARGV || $ARGV[$i + 1] =~ /^--/;
        }
    }
    Configure(qw(no_auto_abbrev no_ignore_case require_order));
    GetOptions('source=s' => \$source, 'target=s' => \$target,
        'root=s@' => \@roots, 'apply' => \$apply, 'help' => \$help)
        or die "invalid arguments; use --help\n";
    if ($help) {
        print "Usage: sh stow-prune.sh --source DIR --target DIR [--root FORMER_TOP_LEVEL] [--apply]\n",
            "Preview by default. Host Perl required. Do not run during Stow, checkout or path renames.\n";
        return;
    }
    die "--source and --target are required; use --help\n" unless defined($source) && defined($target) && !@ARGV;
    my $input_target = File::Spec->canonpath($target);
    die "target must not be a symlink\n" if -l $input_target;
    $source = abs_path($source);
    $target = abs_path($target);
    die "source and target must be existing directories\n" unless defined($source) && defined($target) && -d $source && -d $target;
    die "unsafe source/target boundary\n" if $source eq '/' || $target eq '/' || $target eq $source || index($target, "$source/") == 0;
    for (@roots) {
        die "--root must be a single top-level name\n" if !length || m{/} || $_ eq '.' || $_ eq '..';
    }
    load_ignores();  # Compile every policy before scanning, and before any unlink.
    my @source_roots;
    for my $name (entries($source)) {
        my $st = metadata("$source/$name");
        push @source_roots, dotname($name) if $st && S_ISDIR($st->[2]) && !source_ignored($name);
    }
    for my $name (entries($target)) {
        my $st = metadata("$target/$name");
        scan("$target/$name", $name) if $st && S_ISLNK($st->[2]);
    }
    scan("$target/$_", $_) for @source_roots, @roots;
    for my $item (@plan) {
        if ($apply) {
            my $now = candidate($item->{path});
            die "candidate changed; rerun preview\n" unless $now && $now->{identity} eq $item->{identity} && $now->{raw} eq $item->{raw};
            unlink($item->{path}) or die "cannot unlink: $!\n";
            $removed++;
        }
        print($apply ? 'removed ' : 'would remove ', quoted($item->{path}), "\n");
    }
    print scalar(@plan), $apply ? " obsolete link(s) removed.\n" : " obsolete link(s); preview only.\n";
}

eval { main(); 1 } or do {
    print STDERR "stow-prune: $@", "$removed link(s) already removed; no rollback.\n";
    exit 1;
};
PERL
