from pathlib import Path
import re, sys
R=Path(__file__).resolve().parents[1]
checks=[]
def ok(name,cond):
    checks.append((name,bool(cond))); print(('PASS' if cond else 'FAIL'),name)
def text(name): return (R/name).read_text(encoding='utf-8',errors='ignore')
pos=text('frente-loja.html'); idx=text('index.html'); liga=text('index-liga-ondis.html'); css=text('ondis-v11.css'); js=text('ondis-v11.js')
ok('build current', "ondisBuild='12.3.0'" in js)
ok('cash state keeps posCashState', "box.className='posCashState closed'" in pos and "box.className='posCashState open'" in pos)
ok('legacy cashDesk runtime class removed', "box.className='cashDesk" not in pos)
ok('stable compact height', 'height:58px!important' in css and 'posStatusStrip' in css)
ok('client card removed index', '<div class="attClient">' not in idx)
ok('client card removed liga', '<div class="attClient">' not in liga)
ok('attendance stats preserved', 'attStatsGrid' in idx and 'attStatsGrid' in liga)
ok('sold/no sold preserved', '✓ VENDEU' in idx and '✕ NÃO VENDEU' in idx)
ok('queue actions preserved', 'data-act="up"' in idx and 'data-act="down"' in idx and 'data-act="pause"' in idx)
ok('five KPI definitions', idx.count('cor:"') >= 5)
ok('V11 css single load pos', pos.count('ondis-v11.css?v=12.3.0')==1)
ok('V11 js single load pos', pos.count('ondis-v11.js?v=12.3.0')==1)
ok('V11 single load index', idx.count('ondis-v11.js?v=12.3.0')==1)
ok('V11 single load liga', liga.count('ondis-v11.js?v=12.3.0')==1)
failed=[n for n,c in checks if not c]
print(f'\n{len(checks)-len(failed)}/{len(checks)} checks passed')
if failed: print('Failed:', ', '.join(failed)); sys.exit(1)
