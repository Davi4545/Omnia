from pathlib import Path
import re, sys, zipfile
R=Path(__file__).resolve().parents[1]
checks=[]
def ok(name,cond): checks.append((name,bool(cond)))
def text(n): return (R/n).read_text(errors='ignore')
js=text('ondis-v11.js'); css=text('ondis-v11.css'); pos=text('frente-loja.html'); caixa=text('caixa.html')
ok('V11 assets exist',(R/'ondis-v11.js').exists() and (R/'ondis-v11.css').exists())
ok('POS loads V11','ondis-v11.js?v=' in pos)
ok('Caixa loads V11','ondis-v11.js?v=' in caixa)
ok('Sale remains in Frente de Loja','Finalizar venda' in pos and 'finishSale' in pos)
ok('Exchange flow preserved','Troca de produto' in pos and 'saveExchange' in pos)
ok('Gift flow preserved','checkoutGift' in pos and 'saleGiftToggle' in pos)
ok('Cashback preserved','cashback' in pos.lower())
ok('Finance 4 injection','Financeiro 4.0' in js and 'Meta reversa' in js and 'Cenário “E se?”' in js)
ok('Collections Intelligence','Collections Intelligence' in js and 'Giro × Margem' in js)
ok('Unified CRM','crm unificado' in js.lower() and 'CRM 360°' in js)
ok('Gamification 2','Temporada ONDIS' in js and 'Missões inteligentes' in js)
ok('ONDIS Inbox','Inbox' in js and 'v11InboxMini' in js)
ok('Context agent','ONDIS Intelligence' in js and 'injectAgent' in js)
ok('Suspended sale','Suspender venda' in js and 'ondis_v11_suspended' in js)
ok('Responsive CSS','@media(max-width:650px)' in css)
failed=[n for n,c in checks if not c]
for n,c in checks: print(('PASS' if c else 'FAIL'),n)
print(f'\n{len(checks)-len(failed)}/{len(checks)} checks passed')
sys.exit(1 if failed else 0)
