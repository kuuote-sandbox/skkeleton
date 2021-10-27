let s:type = 'native'
let s:old_preedit = 'xyzzy'

function! skkeleton#test#autocomplete(type) abort
  let s:type = a:type
  augroup skkeleton-test-complete
    autocmd!
    autocmd User skkeleton-handled call skkeleton#test#complete()
  augroup END
endfunction

function! skkeleton#test#complete(...) abort
  let type = get(a:000, 0, s:type)
  let preedit = skkeleton#request('getPreEdit', [])
  if s:old_preedit ==# preedit
    return
  endif
  let s:old_preedit = preedit
  let candidates = denops#request('skkeleton', 'getCandidates', [])
  let items = []
  for [kana, cs] in candidates
    call map(cs, '{"word": split(v:val, ";")[0], "abbr": v:val, "user_data": {"kana": kana, "word": v:val}}')
    let items += cs
    if len(items) > 100
      break
    endif
  endfor
  let col = col('.') - len(preedit)
  if type ==# 'pum.vim'
    call pum#open(col, items)
  else
    call complete(col, items)
  endif
endfunction
