---------------------------------------------------------------------- No-plugin

---------------------------------------------------- Aliases
local execute = vim.api.nvim_command
local opt     = vim.opt -- global
local api     = vim.api -- access vim api
local o       = vim.o   -- global
local g       = vim.g   -- global for let options
local wo      = vim.wo  -- window local
local bo      = vim.bo  -- buffer local
local fn      = vim.fn  -- access vim functions
local cmd     = vim.cmd -- vim commands
local win     = fn.has('win16') or fn.has('win32') or fn.has('win64')
local linux   = fn.has('unix') and not fn.system('uname -s') == 'Darwin'
local mac     = fn.has('unix') and fn.system('uname -s') == 'Darwin'
------------------------------------------------ End aliases

---------------------------------------------------- General
--o.nocompatible = true
cmd 'filetype plugin on'
-- Display all matching files when we tab complete
o.wildmenu = true
o.wildignorecase = true
-- Auto reload file on changes outside editor
o.autoread = true
o.hidden = true
o.cmdheight = 2
--set encoding=utf-8
o.mouse = 'a'
if vim.g.neovide then
	-- Put anything you want to happen only in Neovide here
	o.guifont = 'Iosevka Nerd Font:h14'
	g.neovide_cursor_animation_length = 0
	-- Helper function for transparency formatting
	-- g:neovide_transparency should be 0 if you want to unify transparency of content and title bar.
	g.neovide_transparency = 0.0
	g.transparency = 0.8
	g.neovide_floating_blur_amount_x = 2.0
	g.neovide_floating_blur_amount_y = 2.0
	g.neovide_transparency = 0.8
end
o.linespace = 4
o.ignorecase = true
o.smartcase = true
o.smartindent = true
o.confirm = true
o.signcolumn = 'yes'
o.number = true
--o.relativenumber = true
o.cursorline = true
o.scrolloff = 10
o.wrap = true
--o.colorcolumn = '80,100,120,140,160,180,200'
o.binary = true
--o.list = true
--o.listchars = 'eol:$,tab:>-,trail:_,extends:>,precedes:<'
o.concealcursor = ''
o.conceallevel = 1
o.backspace = 'indent,eol,start'
o.spell = true
o.completeopt = 'menu,preview,menuone,longest'
if fn.executable('pyenv') then
	g.python_host_prog = fn.system('pyenv shims | grep "/python2$" | tr -d "\n"')
	g.python3_host_prog = fn.system('pyenv shims | grep "/python3$" | tr -d "\n"')
end
------------------------------------------------ End General

----------------------------------------------- Highlighting
cmd 'syntax enable'
cmd 'syntax on'
------------------------------------------- End Highlighting

------------------------------------------------------ Netrw
g.netrw_banner = 0       -- disable annoying banner
g.netrw_browse_split = 4 -- open in prior window
g.netrw_altv = 1         -- open splits to the right
g.netrw_liststyle = 3    -- tree view
g.netrw_list_hide = { fn['netrw_gitignore#Hide()'], ',\\(^\\|\\s\\s\\)\\zs\\.\\S\\+' }
-------------------------------------------------- End Netrw

----------------------------------------- Keyboard shortcuts
-- Change leader key
g.mapleader = ' '
-- Visual indication of leader key timeout
o.showcmd = true
-- map helper
local function map(mode, lhs, rhs, opts)
	local options = { noremap = true }
	if opts then options = vim.tbl_extend('force', options, opts) end
	api.nvim_set_keymap(mode, lhs, rhs, options)
end

-- Copy and paste
map('v', '<C-c>', '"+y')
map('v', '<C-x>', '"+c')
map('v', '<S-Insert>', 'c<ESC>"+p')
map('i', '<S-Insert>', '<ESC>"+pa')
-- Map Ctrl-Del to delete word
map('i', '<C-Delete>', '<ESC>bdwi')
------------------------------------- End keyboard shortcuts

---------------------------------------------------- Autocmd
-------- This function is taken from https://github.com/norcalli/nvim_utils
local function nvim_create_augroups(definitions)
	for group_name, definition in pairs(definitions) do
		execute('augroup ' .. group_name)
		execute('autocmd!')
		for _, def in ipairs(definition) do
			local command = table.concat(vim.tbl_flatten { 'autocmd', def }, ' ')
			execute(command)
		end
		execute('augroup END')
	end
end

-- https://neovim.discourse.group/t/reload-init-lua-and-all-require-d-scripts/971/11
function _G.ReloadConfig()
	local hls_status = vim.v.hlsearch
	for name, _ in pairs(package.loaded) do
		if name:match('^cnull') then
			package.loaded[name] = nil
		end
	end
	dofile(vim.env.MYVIMRC)
	if hls_status == 0 then
		vim.opt.hlsearch = false
	end
end

local autocmds = {
	reload_vimrc = {
		-- Reload vim config automatically
		{ 'BufWritePost', [[$VIM_PATH/{*.vim,*.yaml,vimrc} nested source $MYVIMRC | redraw]] },
		{ 'BufWritePre',  '$MYVIMRC',                                                        'lua ReloadConfig()' },
	},
	terminal_job = {
		--{ 'TermOpen', '*', [[tnoremap <buffer> <Esc> <c-\><c-n>]] };
		{ 'TermOpen', '*', 'startinsert' },
		{ 'TermOpen', '*', 'setlocal listchars= nonumber norelativenumber' },
	},
	save_shada = {
		{ 'VimLeave', '*', 'wshada!' },
	},
	resize_windows_proportionally = {
		{ 'VimResized', '*', ':wincmd =' },
	},
	--toggle_search_highlighting = {
	--    { 'InsertEnter', '*', 'setlocal nohlsearch' };
	--};
	lua_highlight = {
		{ 'TextYankPost', '*', [[silent! lua vim.highlight.on_yank() {higroup='IncSearch', timeout=400}]] },
	},
	--ansi_esc_log = {
	--    { 'BufEnter', '*.log', ':AnsiEsc' };
	--};
	--file_type = {
	--  { 'FileType', 'html',       'setlocal shiftwidth=2 tabstop=2 expandtab' },
	--  { 'FileType', 'xml',        'setlocal shiftwidth=2 tabstop=2 expandtab' },
	--  { 'FileType', 'javascript', 'setlocal shiftwidth=2 tabstop=2 expandtab' },
	--  { 'FileType', 'typescript', 'setlocal shiftwidth=2 tabstop=2 expandtab' },
	--  { 'FileType', 'json',       'setlocal shiftwidth=2 tabstop=2 expandtab' },
	--  { 'FileType', 'dart',       'setlocal shiftwidth=2 tabstop=2 expandtab' },
	--  { 'FileType', 'markdown',   'setlocal shiftwidth=2 tabstop=2 noexpandtab' },
	--  { 'FileType', 'go', 'setlocal nolist'};
	--}
}

nvim_create_augroups(autocmds)
------------------------------------------------ End autocmd

------------------------------------------------------- Misc
--------------------------------------------------- End Misc

------------------------------------------- Custom functions
--------------------------------------- End custom functions

-------------------------------------------- External config
-- exrc allows loading local config files.
o.exrc = true
o.secure = true
---------------------------------------- End external config

----------------------------------------------------------------- End No-plugins

-- Install packer
local install_path = fn.stdpath('data') .. '/site/pack/packer/opt/packer.nvim'
local first_time_packer = false

if fn.empty(vim.fn.glob(install_path)) > 0 then
	execute('!git clone https://github.com/wbthomason/packer.nvim ' .. install_path)
	first_time_packer = true
end

cmd [[packadd packer.nvim]]
local packer_autocmds = {
	packer = {
		{ 'BufWritePost', 'plugins.lua', 'PackerCompile' },
	},
}

nvim_create_augroups(packer_autocmds)

local use = require('packer').use
require('packer').startup({
	function()
		use { 'wbthomason/packer.nvim', opt = true }
		-- Use devcontainer just like VsCode
		use {
			'esensar/nvim-dev-container',
			requires = {
				'nvim-treesitter/nvim-treesitter',
			},
			config = function()
				require("devcontainer").setup({
				})
			end,
		}
		-- Fuzzy finder and file browser
		use {
			'nvim-telescope/telescope-project.nvim',
			requires = {
				'nvim-telescope/telescope.nvim',
				'nvim-lua/plenary.nvim',
				'nvim-telescope/telescope-file-browser.nvim',
			}
		}
		-- Editor toolings
		use {
			"williamboman/mason.nvim",
			"williamboman/mason-lspconfig.nvim",
			"mfussenegger/nvim-dap",
			"neovim/nvim-lspconfig",
			run = ":MasonUpdate" -- :MasonUpdate updates registry contents
		}
		-- Language clients
		--use {'neoclide/coc.nvim', branch = 'release'}
		use {
			'ray-x/navigator.lua',
			requires = {
				{ 'ray-x/guihua.lua',     run = 'cd lua/fzy && make' },
				{ 'neovim/nvim-lspconfig' },
			},
		}
		-- Linters
		use {
			"nvimdev/guard.nvim",
			requires = {
				"nvimdev/guard-collection",
			},
		}
		-- AI code completion
		-- Tabnine
		--local function tabnine_build_path()
		--  -- Replace vim.uv with vim.loop if using NVIM 0.9.0 or below
		--  if vim.uv.os_uname().sysname == "Windows_NT" then
		--    return "pwsh.exe -file .\\dl_binaries.ps1"
		--  else
		--    return "./dl_binaries.sh"
		--  end
		--end
		--use {
		--  'codota/tabnine-nvim',
		--  run = tabnine_build_path(),
		--  config = function()
		--    require('tabnine').setup({
		--      accept_keymap = false,
		--      dismiss_keymap = false,
		--    })
		--  end
		--}
		-- Github Copilot
		use {
			"zbirenbaum/copilot.lua",
			cmd = "Copilot",
			event = "InsertEnter",
			config = function()
				require("copilot").setup({})
			end,
		}
		---- TODO: Self-hosted LLM backend
		--use({
		--  "olimorris/codecompanion.nvim",
		--  config = function()
		--    require("codecompanion").setup()
		--  end,
		--  requires = {
		--    "nvim-lua/plenary.nvim",
		--    "nvim-treesitter/nvim-treesitter",
		--  }
		--})
		-- Completion engine plugin for neovim written in Lua
		use {
			'hrsh7th/nvim-cmp',
			requires = {
				'hrsh7th/cmp-buffer',
				'hrsh7th/cmp-nvim-lsp',
				'hrsh7th/cmp-nvim-lsp-signature-help',
				'hrsh7th/cmp-emoji',
				'hrsh7th/cmp-vsnip',
				'hrsh7th/vim-vsnip',
				'FelipeLema/cmp-async-path',
			}
		}
		use {
			"zbirenbaum/copilot-cmp",
			after = { "copilot.lua" },
			config = function()
				require("copilot_cmp").setup()
			end
		}
		-- Add surrounding brackets, quotes, xml tags,...
		use 'tpope/vim-surround'
		-- Extended matching for the % operator
		use 'adelarsq/vim-matchit'
		-- Autocompletion for pairs
		--use 'Raimondi/delimitMate'
		-- Multiple cursor
		--use 'terryma/vim-multiple-cursors'
		-- Edit a region in new buffer
		use 'chrisbra/NrrwRgn'
		-- Run shell command asynchromously
		use 'skywind3000/asyncrun.vim'
		-- REPL alike
		use 'thinca/vim-quickrun'
		g.quickrun_no_default_key_mappings = 1
		-- Text object per indent level
		use { 'michaeljsmith/vim-indent-object', ft = { 'python' } }
		-- Code commenting
		use 'scrooloose/nerdcommenter'
		-- Git wrapper
		use 'tpope/vim-fugitive'
		-- Git signs in gutter
		use {
			'lewis6991/gitsigns.nvim',
			config = function()
				require('gitsigns').setup()
			end
		}
		-- Interact with databases
		use {
			'kristijanhusak/vim-dadbod-ui',
			requires = { 'tpope/vim-dadbod' }
		}
		-- Automatically toggle relative line number
		--use 'jeffkreeftmeijer/vim-numbertoggle'
		-- Use registers as stack for yank and delete
		use 'maxbrunsfeld/vim-yankstack'
		-- Status line
		use {
			'hoob3rt/lualine.nvim',
			requires = { 'kyazdani42/nvim-web-devicons', opt = true }
		}
		-- Delete buffers without messing window layout
		use 'moll/vim-bbye'
		-- Maintain coding style per project
		use 'editorconfig/editorconfig-vim'
		-- Language packs
		use 'sheerun/vim-polyglot'
		use 'jidn/vim-dbml'
		-- Highlight using language servers
		use { 'nvim-treesitter/nvim-treesitter', run = ':TSUpdate' }
		use { 'nvim-treesitter/nvim-treesitter-refactor' }
		-- Detect file encoding
		use 's3rvac/AutoFenc'
		-- Indent line
		use 'Yggdroot/indentLine'
		-- Theme
		use 'morhetz/gruvbox'

		---------------------------------------- Custom commands
		------------------------------------ End custom commands

		-------------------------------------------------- Theme
		-- GruvBox
		cmd 'highlight Normal ctermbg=none ctermfg=white guibg=none'
		g.gruvbox_italic = 1
		g.gruvbox_contrast_dark = 'hard'
		g.gruvbox_invert_tabline = 1
		g.gruvbox_invert_indent_guides = 1
		g.gruvbox_transparent_bg = 1
		cmd 'colorscheme gruvbox'
		---------------------------------------------- End theme

		------------------------------------------------ Autocmd
		local plugin_autocmds = {
			packer = {
				{ 'BufWritePost', 'plugins.lua', 'PackerCompile' },
			},
		}

		nvim_create_augroups(plugin_autocmds)
		-------------------------------------------- End autocmd

		------------------------------------- Keyboard shortcuts
		-- Expand CR when autocomplete pairs
		g.delimitMate_expand_cr = 2
		g.delimitMate_expand_space = 1
		g.delimitMate_expand_inside_quotes = 1
		g.delimitMate_jump_expansion = 1
		-- Tab switching
		map('n', '<c-tab>', ':tabnext<cr>', { noremap = false })
		map('n', '<leader><tab>', ':tabnext<cr>', { noremap = false })
		map('n', '<c-s-tab>', ':tabprevious<cr>', { noremap = false })
		map('n', '<leader><leader><tab>', ':tabprevious<cr>', { noremap = false })
		-- Delete buffer without messing layout
		map('n', '<Leader>x', ':Bd<cr>', { noremap = false })
		-- Key mapping for fuzzy finder
		map('n', '<leader><leader>', '<cmd>Telescope<cr>')
		map('n', '<leader><leader>f',
			'<cmd>lua require"telescope.builtin".find_files({ find_command = {"rg", "--files", "--hidden", "-g", "!.git" }})<cr>')
		map('n', '<leader><leader>br', '<cmd>Telescope file_browser<cr>')
		map('n', '<leader><leader>pj', '<cmd>Telescope project<cr>')
		map('n', '<leader><leader>s', '<cmd>Telescope grep_string<cr>')
		map('n', '<leader><leader>g', '<cmd>Telescope live_grep<cr>')
		map('n', '<leader><leader>bu', '<cmd>Telescope buffers<cr>')
		map('n', '<leader><leader>h', '<cmd>Telescope help_tags<cr>')
		-- Key mapping for native LSP
		map('n', 'ff', '<cmd>lua vim.lsp.buf.format()<cr>')
		---- Key mapping for git signs
		-- Navigation
		map('n', ']c', "&diff ? ']c' : '<cmd>Gitsigns next_hunk<CR>'", { expr = true })
		map('n', '[c', "&diff ? '[c' : '<cmd>Gitsigns prev_hunk<CR>'", { expr = true })

		-- Actions
		map('n', '<leader>hs', ':Gitsigns stage_hunk<CR>')
		map('v', '<leader>hs', ':Gitsigns stage_hunk<CR>')
		map('n', '<leader>hr', ':Gitsigns reset_hunk<CR>')
		map('v', '<leader>hr', ':Gitsigns reset_hunk<CR>')
		map('n', '<leader>hS', '<cmd>Gitsigns stage_buffer<CR>')
		map('n', '<leader>hu', '<cmd>Gitsigns undo_stage_hunk<CR>')
		map('n', '<leader>hR', '<cmd>Gitsigns reset_buffer<CR>')
		map('n', '<leader>hp', '<cmd>Gitsigns preview_hunk<CR>')
		map('n', '<leader>hb', '<cmd>lua require"gitsigns".blame_line{full=true}<CR>')
		map('n', '<leader>tb', '<cmd>Gitsigns toggle_current_line_blame<CR>')
		map('n', '<leader>hd', '<cmd>Gitsigns diffthis<CR>')
		map('n', '<leader>hD', '<cmd>lua require"gitsigns".diffthis("~")<CR>')
		map('n', '<leader>td', '<cmd>Gitsigns toggle_deleted<CR>')

		-- Text object
		map('o', 'ih', ':<C-U>Gitsigns select_hunk<CR>')
		map('x', 'ih', ':<C-U>Gitsigns select_hunk<CR>')
		--------------------------------- End keyboard shortcuts

		------------------------------------- Statusline/tabline
		require('lualine').setup {
			options = {
				theme = 'gruvbox',
				--component_separators = {'', ''},
				--section_separators = {'', ''},
				--disabled_filetypes = {}
			},
			--sections = {
			--    lualine_a = {'mode'},
			--    lualine_b = {'branch'},
			--    lualine_c = {'filename'},
			--    lualine_x = {'encoding', 'fileformat', 'filetype'},
			--    lualine_y = {'progress'},
			--    lualine_z = {'location'}
			--},
			--inactive_sections = {
			--    lualine_a = {},
			--    lualine_b = {},
			--    lualine_c = {'filename'},
			--    lualine_x = {'location'},
			--    lualine_y = {},
			--    lualine_z = {}
			--},
			--tabline = {},
			--extensions = {}
		}
		--------------------------------- End statusline/tabline

		------------------------------------------- Fuzzy finder
		require('telescope').setup {
			extensions = {
				file_browser = {
					theme = 'ivy',
					-- disables netrw and use telescope-file-browser in its place
					hijack_netrw = true,
					collapse_dirs = true,
					auto_depth = true,
				},
			},
		}
		-- To get telescope-file-browser loaded and working with telescope,
		-- you need to call load_extension, somewhere after setup function:
		require('telescope').load_extension('file_browser')
		require('telescope').load_extension('project')
		--------------------------------------- End fuzzy finder

		-------------------------------------- Language specific
		-- Dart
		g.dart_html_in_string = true
		g.dart_style_guide = 2
		g.dart_format_on_save = 0
		-- Rust
		g.rustfmt_autosave = 1
		g.racer_experimental_completer = 1
		g.racer_insert_paren = 1
		if win then
			g.rust_clip_command = 'win32yank'
		elseif linux then
			g.rust_clip_command = 'xclip -selection clipboard'
		elseif mac then
			g.rust_clip_command = 'pbcopy'
		end
		---------------------------------- End language specific

		---------------------------------------- Language server
		-- navigator.lua
		require 'navigator'.setup({
			mason = true,
		})
		--- coc.nvim
		--require('coc')

		-- nvim-treesitter
		require 'nvim-treesitter.configs'.setup {
			auto_install = true,
			highlight = {
				enable = true,
				-- Setting this to true will run `:h syntax` and tree-sitter at the same time.
				-- Set this to `true` if you depend on 'syntax' being enabled (like for indentation).
				-- Using this option may slow down your editor, and you may see some duplicate highlights.
				-- Instead of true it can also be a list of languages
				additional_vim_regex_highlighting = false,
			},
			indent = {
				enable = true
			},
		}
		o.foldmethod = 'expr'
		o.foldexpr = 'nvim_treesitter#foldexpr()'
		o.foldenable = false
		------------------------------------ End language server

		------------------------------------------------- Linter
		local ft = require('guard.filetype')

		-- Format c, cpp, cs, java, cuda, proto
		if fn.executable('clang-format') == 1 then
			ft('c,cpp,cs,java,cuda,proto'):fmt('clang-format')
		end
		-- Eslint for js, jsx, ts, tsx, vue
		if fn.executable('eslint') == 1 then
			ft('js,jsx,ts,tsx,vue'):fmt({
				cmd = 'eslint',
				args = { '--fix' },
			}):lint('eslint')
		end
		-- Prettier format html, css, json, etc..
		if fn.executable('prettier') == 1 then
			ft('typescript,javascript,typescriptreact,html,css,scss,json,yaml,markdown,graphql,md,txt'):fmt(
				'prettier')
		end
		-- Golang
		if fn.executable('gofmt') == 1 then
			ft('go'):fmt('gofmt')
		end
		-- Rust
		if fn.executable('rustfmt') == 1 then
			ft('rust'):fmt('rustfmt')
		end
		-- Python
		if fn.executable('ruff') == 1 then
			ft('python'):fmt('ruff')
		end
		-- Lint protobuf
		if fn.executable('buf') == 1 then
			ft('proto'):lint({
				cmd = 'buf',
				args = { 'lint' },
			})
		end

		-- Call setup() LAST!
		g.guard_config = {
			-- the only options for the setup function
			fmt_on_save = true,
			-- Use lsp if no formatter was defined for this filetype
			lsp_as_default_formatter = true,
			save_on_fmt = false,
		}
		--------------------------------------------- End linter

		--------------------------------------------- Completion
		local has_words_before = function()
			unpack = unpack or table.unpack
			local line, col = unpack(api.nvim_win_get_cursor(0))
			return col ~= 0 and
					api.nvim_buf_get_lines(0, line - 1, line, true)[1]:sub(col, col):match("%s") == nil
		end

		local cmp = require('cmp')
		cmp.setup({
			snippet = {
				-- REQUIRED - you must specify a snippet engine
				expand = function(args)
					fn["vsnip#anonymous"](args.body) -- For `vsnip` users.
					-- vim.snippet.expand(args.body) -- For native neovim snippets (Neovim v0.10+)
				end,
			},
			mapping = cmp.mapping.preset.insert({
				--['<C-y>'] = cmp.mapping.confirm({ select = true }),
				["<Tab>"] = cmp.mapping(function(fallback)
					if cmp.visible() then
						cmp.select_next_item()
					elseif has_words_before() then
						cmp.complete()
					else
						fallback() -- The fallback function sends a already mapped key. In this case, it's probably `<Tab>`.
					end
				end, { "i", "s" }),
				["<S-Tab>"] = cmp.mapping(function()
					if cmp.visible() then
						cmp.select_prev_item()
					end
				end, { "i", "s" }),
				['<C-b>'] = cmp.mapping.scroll_docs(-4),
				['<C-f>'] = cmp.mapping.scroll_docs(4),
				--['<C-Space>'] = cmp.mapping(function()
				--  if require("tabnine.keymaps").has_suggestion() then
				--    return require("tabnine.keymaps").accept_suggestion()
				--  else
				--    return cmp.complete()
				--  end
				--end, { "i", "s" }),
				['<C-e>'] = cmp.mapping.abort(),
				['<CR>'] = cmp.mapping.confirm({
					select = true,
				})
			}),
			sources = {
				{ name = 'async_path' },
				{ name = 'buffer' },
				{ name = 'nvim_lsp' },
				{ name = 'nvim_lsp_signature_help' },
				{ name = 'emoji' },
			}
		})
		-- The nvim-cmp almost supports LSP's capabilities so You should advertise it to LSP servers..
		local capabilities = vim.lsp.protocol.make_client_capabilities()
		capabilities = require('cmp_nvim_lsp').default_capabilities(capabilities)
		----------------------------------------- End completion

		--------------------------------- Editor tooling manager
		require("mason").setup()
		require("mason-lspconfig").setup {
			ensure_installed = {
				'bashls',
				'cssls',
				'cssmodules_ls',
				'diagnosticls',
				'dockerls',
				'docker_compose_language_service',
				'emmet_ls',
				'eslint',
				'grammarly',
				'html',
				'jsonls',
				'ts_ls',
				'lua_ls',
				'pyright',
				'rust_analyzer',
				'sqlls',
				'stylelint_lsp',
				'tailwindcss',
				'vimls',
				'yamlls',
			},
			--automatic_installation = true,
		}
		require("mason-lspconfig").setup_handlers {
			-- The first entry (without a key) will be the default handler
			-- and will be called for each installed server that doesn't have
			-- a dedicated handler.
			function(server_name) -- default handler (optional)
				-- Prevent some LSP servers from autostart
				local no_autostart = { 'deno', 'denols' }
				require("lspconfig")[server_name].setup {
					autostart = not no_autostart[server_name],
					single_file_support = true,
					-- advertise capabilities to language servers.
					capabilities = capabilities,
				}
			end,
			-- Next, you can provide a dedicated handler for specific servers.
			-- For example, a handler override for the `rust_analyzer`:
			["denols"] = function()
				require("rust-tools").setup {}
			end
		}
		----------------------------- End editor tooling manager
	end,
	config = {
		git = {
			clone_timeout = 6000,
		},
	}
})

if first_time_packer then
	cmd 'PackerSync'
end
