---------------------------------------------------------------------- No-plugin

---------------------------------------------------- Aliases
local execute    = vim.api.nvim_command
local opt        = vim.opt        -- global
local api        = vim.api        -- access vim api
local o          = vim.o          -- global
local g          = vim.g          -- global for let options
local wo         = vim.wo         -- window local
local bo         = vim.bo         -- buffer local
local fn         = vim.fn         -- access vim functions
local cmd        = vim.cmd        -- vim commands
local diagnostic = vim.diagnostic -- vim diagnostic
local lsp        = vim.lsp        -- vim lsp
local win        = fn.has('win16') or fn.has('win32') or fn.has('win64')
local linux      = fn.has('unix') and not fn.system('uname -s') == 'Darwin'
local mac        = fn.has('unix') and fn.system('uname -s') == 'Darwin'
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
if g.neovide then
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
g.maplocalleader = "\\"
-- Visual indication of leader key timeout
o.showcmd = true
-- map helper
local function map(mode, lhs, rhs, opts)
	local options = { noremap = true }
	if opts then options = vim.tbl_extend('force', options, opts) end
	api.nvim_set_keymap(mode, lhs, rhs, options)
end

-- Save
map("n", "<C-s>", "<cmd>w<CR>", { desc = "general save file" })
-- Copy and paste
map("n", "<C-c>", "<cmd>%y+<CR>", { desc = "copy whole file" })
map('v', '<C-c>', '"+y', { desc = "copy selected" })
map('v', '<C-x>', '"+c', { desc = "cut selected" })
map('v', '<S-Insert>', 'c<ESC>"+p')
map('i', '<S-Insert>', '<ESC>"+pa')
-- Map Ctrl-Del to delete word
map('i', '<C-Delete>', '<ESC>bdwi')
-- Tab switching (buffers)
map("n", "<tab>", ":bn<cr>", { desc = "buffer goto next" })
map("n", "<S-tab>", ":bp<cr>", { desc = "buffer goto prev" })
--map('n', '<c-tab>', ':tabnext<cr>', { noremap = false })
--map('n', '<leader><tab>', ':tabnext<cr>', { noremap = false })
--map('n', '<c-s-tab>', ':tabprevious<cr>', { noremap = false })
--map('n', '<leader><leader><tab>', ':tabprevious<cr>', { noremap = false })
-- Key mapping for native LSP
--map('n', 'ff', '<cmd>lua vim.lsp.buf.format()<cr>')
-- Misc
map("i", "<C-b>", "<ESC>^i", { desc = "move beginning of line" })
map("i", "<C-e>", "<End>", { desc = "move end of line" })
map("i", "<C-h>", "<Left>", { desc = "move left" })
map("i", "<C-l>", "<Right>", { desc = "move right" })
map("i", "<C-j>", "<Down>", { desc = "move down" })
map("i", "<C-k>", "<Up>", { desc = "move up" })
-- Windows
map("n", "<C-h>", "<C-w>h", { desc = "switch window left" })
map("n", "<C-l>", "<C-w>l", { desc = "switch window right" })
map("n", "<C-j>", "<C-w>j", { desc = "switch window down" })
map("n", "<C-k>", "<C-w>k", { desc = "switch window up" })
-- Highlight
map("n", "<Esc>", "<cmd>noh<CR>", { desc = "clear highlights" })
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

-- Bootstrap lazy.nvim
local lazypath = vim.fn.stdpath("data") .. "/lazy/lazy.nvim"
if not (vim.uv or vim.loop).fs_stat(lazypath) then
	local lazyrepo = "https://github.com/folke/lazy.nvim.git"
	local out = vim.fn.system({ "git", "clone", "--filter=blob:none", "--branch=stable", lazyrepo, lazypath })
	if vim.v.shell_error ~= 0 then
		vim.api.nvim_echo({
			{ "Failed to clone lazy.nvim:\n", "ErrorMsg" },
			{ out,                            "WarningMsg" },
			{ "\nPress any key to exit..." },
		}, true, {})
		vim.fn.getchar()
		os.exit(1)
	end
end
vim.opt.rtp:prepend(lazypath)

-- Setup lazy.nvim
require("lazy").setup({
	-- Configure any other settings here. See the documentation for more details.
	-- colorscheme that will be used when installing plugins.
	install = { colorscheme = { "gruvbox" } },
	-- automatically check for plugin updates
	checker = { enabled = true },
	spec = {
		-- add your plugins here
		-- Showing keybindings with descriptions
		{ "folke/which-key.nvim" },
		-- Fuzzy finder and file browser
		{
			'nvim-telescope/telescope-project.nvim',
			dependencies = {
				'nvim-telescope/telescope.nvim',
				'nvim-lua/plenary.nvim',
				'nvim-telescope/telescope-file-browser.nvim',
			},
			config = function()
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
				map('n', '<leader><leader>', '<cmd>Telescope<cr>')
				map('n', '<leader><leader>f',
					'<cmd>lua require"telescope.builtin".find_files({ find_command = {"rg", "--files", "--hidden", "-g", "!.git" }})<cr>')
				map('n', '<leader><leader>br', '<cmd>Telescope file_browser<cr>')
				map('n', '<leader><leader>pj', '<cmd>Telescope project<cr>')
				map('n', '<leader><leader>s', '<cmd>Telescope grep_string<cr>')
				map('n', '<leader><leader>g', '<cmd>Telescope live_grep<cr>')
				map('n', '<leader><leader>bu', '<cmd>Telescope buffers<cr>')
				map('n', '<leader><leader>h', '<cmd>Telescope help_tags<cr>')
			end,
		},
		-- Editor toolings
		{
			"williamboman/mason.nvim",
			dependencies = {
				{ "williamboman/mason-lspconfig.nvim" },
				{ "neovim/nvim-lspconfig" },
			},
			config = function()
				require("mason").setup()
				require("mason-lspconfig").setup {
					ensure_installed = {
						--- LLM
						'copilot',
						--- Code quality/security
						'codebook',
						'sourcery',
						--- DB
						'sqlls',
						--- Neovim
						'lua_ls',
						'vimls',
						--- DevOps
						'bashls',
						'docker_compose_language_service',
						'dockerls',
						'terraformls',
						'tflint',
						'yamlls',
						--- HTML/CSS/JS/TS/JSON
						'cssls',
						'cssmodules_ls',
						'emmet_ls',
						'eslint',
						'html',
						'jsonls',
						'stylelint_lsp',
						'ts_ls',
						'tsgo',
						'tailwindcss',
						'vue_ls',
						'vuels',
						--- Python
						'basedpyright',
						'pyrefly',
					},
					--automatic_installation = true,
					handlers = {
						-- The first entry (without a key) will be the default handler
						-- and will be called for each installed server that doesn't have
						-- a dedicated handler.
						function(server_name) -- default handler (optional)
							-- Prevent some LSP servers from autostart
							local no_autostart = { 'deno', 'denols' }
							local no_single_file_support = { 'rust_analyzer' }
							vim.lsp.config(server_name, {
								autostart = not no_autostart[server_name],
								single_file_support = not no_single_file_support[server_name],
							})
						end,
						-- Next, you can provide a dedicated handler for specific servers.
						-- For example, a handler override for the `rust_analyzer`:
						['rust_analyzer'] = function()
							vim.lsp.config('rust_analyzer', {
								settings = {
									['rust-analyzer'] = {
										checkOnSave = {
											enable = false,
										},
										diagnostics = {
											enable = false,
										},
									}
								}
							})
						end,
						['denols'] = function()
							require('rust-tools').setup {}
						end,
					},
				}
			end,
		},
		-- Language clients
		--{'neoclide/coc.nvim', branch = 'release'}
		{
			'ray-x/navigator.lua',
			dependencies = {
				{
					'ray-x/guihua.lua',
					run = 'cd lua/fzy && make',
				},
				{ 'neovim/nvim-lspconfig' },
				{ "nvim-treesitter/nvim-treesitter" },
			},
			config = function()
				require 'navigator'.setup({
					mason = true,
					lsp = {
						diagnostic = {
							virtual_text = true,
							underline = true,
							signs = false,
						},
					},
				})

				-- Setup LSP servers not included by default in navigator.lua
				vim.lsp.config('bacon_ls', {
					init_options = {
						updateOnSave = true,
						updateOnSaveWaitMillis = 1000,
						updateOnChange = true,
					}
				})
			end,
		},
		-- Linters
		{
			"nvimdev/guard.nvim",
			-- Builtin configuration, optional
			dependencies = {
				"nvimdev/guard-collection",
			},
			config = function()
				local ft = require('guard.filetype')

				-- Codespell
				if fn.executable('codespell') == 1 then
					ft('*'):lint('codespell')
				end
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
				if fn.executable('uvx') == 1 then
					ft('python'):fmt({
						cmd = 'uvx',
						args = { 'ruff', 'format', fn.expand('%') },
					})
				end
				-- Lint protobuf
				if fn.executable('buf') == 1 then
					ft('proto'):lint({
						cmd = 'buf',
						args = { 'lint' },
					})
				end

				-- Call setup() LAST!
				-- change this anywhere in your config (or not), these are the defaults
				g.guard_config = {
					-- format on write to buffer
					fmt_on_save = false,
					-- use lsp if no formatter was defined for this filetype
					lsp_as_default_formatter = true,
					-- whether or not to save the buffer after formatting
					save_on_fmt = false,
					-- automatic linting
					auto_lint = true,
					-- how frequently can linters be called
					lint_interval = 1000,
					-- show diagnostic after format done
					refresh_diagnostic = true,
					-- always save file after call Guard fmt
					always_save = false,
				}

				-- Key mapping for guard.nvim
				map('n', 'ff', '<cmd>Guard fmt<cr>')
			end,
		},
		-- Debugger
		{
			"rcarriga/nvim-dap-ui",
			dependencies = {
				"mfussenegger/nvim-dap",
				"nvim-neotest/nvim-nio",
			},
			config = function()
				local dap, dapui = require("dap"), require("dapui")
				dap.listeners.before.attach.dapui_config = function()
					dapui.open()
				end
				dap.listeners.before.launch.dapui_config = function()
					dapui.open()
				end
				dap.listeners.before.event_terminated.dapui_config = function()
					dapui.close()
				end
				dap.listeners.before.event_exited.dapui_config = function()
					dapui.close()
				end
				dapui.setup()
			end,
		},
		-- AI code completion
		-- Github Copilot
		--{
		--  "zbirenbaum/copilot.lua",
		--  cmd = "Copilot",
		--  event = "InsertEnter",
		--  config = function()
		--    require("copilot").setup({})
		--  end,
		--},
		---- TODO: Self-hosted LLM backend
		{
			"olimorris/codecompanion.nvim",
			opts = {
				adapters = {
					http = {
						groq = function()
							return require('codecompanion.adapters').extend('openai', {
								name = 'groq',
								url = "https://api.groq.com/openai/v1/chat/completions",
								env = {
									api_key = "GROQ_API_KEY",
								},
								schema = {
									model = {
										default = "groq/compound",
										choices = {
											"groq/compound",
											"groq/compound-mini",
											"allam-2-7b",
											"meta-llama/llama-prompt-guard-2-86m",
											"moonshotai/kimi-k2-instruct-0905",
											"meta-llama/llama-4-scout-17b-16e-instruct",
											"qwen/qwen3-32b",
											"llama-3.1-8b-instant",
											"meta-llama/llama-4-maverick-17b-128e-instruct",
											"meta-llama/llama-guard-4-12b",
											"moonshotai/kimi-k2-instruct",
											"openai/gpt-oss-20b",
											"openai/gpt-oss-120b",
											"llama-3.3-70b-versatile",
											"meta-llama/llama-prompt-guard-2-22m",
										},
									},
								},
							})
						end,
					}
				},
				strategies = {
					chat = {
						--adapter = "gemini",
						adapter = "copilot",
						model = "gpt-4.1",
					},
					inline = {
						--adapter = "gemini",
						adapter = "copilot",
						model = "gpt-4.1",
					},
				},
				opts = {
					log_level = "DEBUG",
				},
			},
			dependencies = {
				"nvim-lua/plenary.nvim",
				"nvim-treesitter/nvim-treesitter",
			}
		},
		-- Completion engine plugin for neovim written in Lua
		{
			'hrsh7th/nvim-cmp',
			dependencies = {
				'hrsh7th/cmp-buffer',
				'hrsh7th/cmp-nvim-lsp',
				'hrsh7th/cmp-nvim-lsp-signature-help',
				'hrsh7th/cmp-emoji',
				'hrsh7th/cmp-vsnip',
				'hrsh7th/vim-vsnip',
				'FelipeLema/cmp-async-path',
			},
			config = function()
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
			end,
		},
		--{
		--  "zbirenbaum/copilot-cmp",
		--  after = { "copilot.lua" },
		--  config = function()
		--    require("copilot_cmp").setup()
		--  end
		--},
		-- Add surrounding brackets, quotes, xml tags,...
		{ 'tpope/vim-surround' },
		-- Extended matching for the % operator
		{ 'adelarsq/vim-matchit' },
		-- Autocompletion for pairs
		--{
		--  'Raimondi/delimitMate',
		--  config = function()
		--    -- Expand CR when autocomplete pairs
		--    g.delimitMate_expand_cr = 2
		--    g.delimitMate_expand_space = 1
		--    g.delimitMate_expand_inside_quotes = 1
		--    g.delimitMate_jump_expansion = 1
		--  end
		--},
		-- Multiple cursor
		-- { 'terryma/vim-multiple-cursors' },
		-- Edit a region in new buffer
		{ 'chrisbra/NrrwRgn' },
		-- Run shell command asynchronously
		{ 'skywind3000/asyncrun.vim' },
		-- REPL alike
		{
			'thinca/vim-quickrun',
			init = function()
				g.quickrun_no_default_key_mappings = 1
			end,
		},
		-- Toggle terminal
		{
			"akinsho/toggleterm.nvim",
			config = function()
				require("toggleterm").setup()
				local Terminal = require('toggleterm.terminal').Terminal

				-- Keyboard shortcuts
				-- toggleable
				vim.keymap.set({ "n", "t" }, "<A-v>", "<cmd>ToggleTerm direction=vertical size=50<CR>",
					{ desc = "terminal toggleable vertical term" })

				vim.keymap.set({ "n", "t" }, "<A-h>", "<cmd>ToggleTerm direction=horizontal size=12<CR>",
					{ desc = "terminal toggleable horizontal term" })

				vim.keymap.set({ "n", "t" }, "<A-i>", "<cmd>ToggleTerm direction=float<CR>",
					{ desc = "terminal toggle floating term" })

				-- Cli tools
				if fn.executable("pkgx") then
					local lazygit = Terminal:new({ cmd = "pkgx lazygit", direction = 'float', hidden = true })
					local lazydocker = Terminal:new({ cmd = "pkgx lazydocker", direction = 'float', hidden = true })
					local btm = Terminal:new({ cmd = "pkgx btm", direction = 'float', hidden = true })

					api.nvim_create_user_command(
						'Lazygit',
						function()
							if lazygit then
								lazygit:toggle()
							end
						end,
						{ nargs = 0 }
					)
					api.nvim_create_user_command(
						'Lazydocker',
						function()
							if lazydocker then
								lazydocker:toggle()
							end
						end,
						{ nargs = 0 }
					)
					api.nvim_create_user_command(
						'Btm',
						function()
							if btm then
								btm:toggle()
							end
						end,
						{ nargs = 0 }
					)
				end
			end,
		},
		-- Text object per indent level
		{ 'michaeljsmith/vim-indent-object', ft = { 'python' } },
		-- Code commenting
		{ 'scrooloose/nerdcommenter' },
		-- Git wrapper
		{ 'tpope/vim-fugitive' },
		-- Git signs in gutter
		{
			'lewis6991/gitsigns.nvim',
			config = function()
				require('gitsigns').setup()
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
			end
		},
		-- Interact with databases
		{
			'kristijanhusak/vim-dadbod-ui',
			dependencies = { 'tpope/vim-dadbod' },
		},
		-- Automatically toggle relative line number
		--{ 'jeffkreeftmeijer/vim-numbertoggle' },
		-- Use registers as stack for yank and delete
		{ 'maxbrunsfeld/vim-yankstack' },
		-- Status line
		{
			'hoob3rt/lualine.nvim',
			dependencies = { 'kyazdani42/nvim-web-devicons', opt = true },
			config = function()
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
					tabline = {
						lualine_a = { 'buffers' },
						lualine_b = { 'branch' },
						lualine_c = { 'filename' },
						lualine_x = {},
						lualine_y = {},
						lualine_z = { 'tabs' }
					},
					winbar = {
						lualine_a = {},
						lualine_b = {},
						lualine_c = { 'filename' },
						lualine_x = {},
						lualine_y = {},
						lualine_z = {},
					},
					inactive_winbar = {
						lualine_a = {},
						lualine_b = {},
						lualine_c = { 'filename' },
						lualine_x = {},
						lualine_y = {},
						lualine_z = {},
					},
					--extensions = {}
				}
			end,
		},
		-- Delete buffers without messing window layout
		{
			'moll/vim-bbye',
			config = function()
				-- Delete buffer without messing layout
				map('n', '<Leader>x', ':Bd<cr>', { noremap = false })
			end
		},
		-- Maintain coding style per project
		{ 'editorconfig/editorconfig-vim' },
		-- Language packs
		{
			'sheerun/vim-polyglot',
			config = function()
				-- Dart
				g.dart_html_in_string = true
				g.dart_style_guide = 2
				g.dart_format_on_save = 0
				-- Rust
				g.rustfmt_autosave = 0
				g.racer_experimental_completer = 0
				g.racer_insert_paren = 0
				if win then
					g.rust_clip_command = 'win32yank'
				elseif linux then
					g.rust_clip_command = 'xclip -selection clipboard'
				elseif mac then
					g.rust_clip_command = 'pbcopy'
				end

				-- Override conceal level for markdown
				cmd [[autocmd FileType markdown setlocal conceallevel=1]]
				-- Override concealcursor for markdown
				cmd [[autocmd FileType markdown setlocal concealcursor=]]
			end,
		},
		{ 'jidn/vim-dbml' },
		{
			'saecki/crates.nvim',
			event = { "BufRead Cargo.toml" },
			config = function()
				require('crates').setup()
			end,
		},
		-- Highlight using language servers
		{
			'nvim-treesitter/nvim-treesitter',
			lazy = false,
			build = ':TSUpdate',
		},
		{ 'nvim-treesitter/nvim-treesitter-locals' },
		-- Render preview for Markdown/HTML/Latex
		--{
		--  "OXY2DEV/markview.nvim",
		--  requires = {
		--    { "nvim-treesitter/nvim-treesitter" },
		--    { "nvim-tree/nvim-web-devicons" },
		--  },
		--  config = function()
		--    require('markview').setup({
		--      initial_state = false,
		--      --hybrid_modes = { 'n' }
		--    })
		--  end,
		--},
		{
			'MeanderingProgrammer/render-markdown.nvim',
			after = { 'nvim-treesitter' },
			dependencies = { 'echasnovski/mini.nvim', opt = true }, -- if you use the mini.nvim suite
			-- dependencies = { 'echasnovski/mini.icons', opt = true }, -- if you use standalone mini plugins
			-- dependencies = { 'nvim-tree/nvim-web-devicons', opt = true }, -- if you prefer nvim-web-devicons
			config = function()
				require('render-markdown').setup({})
			end,
		},
		-- Detect file encoding
		{ 's3rvac/AutoFenc' },
		-- Indent line for code wrapping
		{ 'Yggdroot/indentLine' },
		-- Theme
		{
			'morhetz/gruvbox',
			lazy = false,
			priority = 1000,
			config = function()
				g.gruvbox_italic = 1
				g.gruvbox_contrast_dark = 'hard'
				g.gruvbox_invert_tabline = 1
				g.gruvbox_invert_indent_guides = 1
				g.gruvbox_transparent_bg = 1
				cmd [[colorscheme gruvbox]]
				cmd [[highlight Normal ctermbg=none ctermfg=white guibg=none]]
			end,
		},
	},
})
