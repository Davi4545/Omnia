from pathlib import Path
R=Path(__file__).resolve().parents[1]
def test_modules_exist():
    names=['compras-inteligentes.html','collections.html','marketing.html','fidelidade.html','equipe-360.html','auditoria.html','omnichannel.html','autopilot.html']
    assert all((R/n).exists() for n in names)
def test_menu_links():
    s=(R/'index.html').read_text(encoding='utf-8')
    for n in ['compras-inteligentes.html','collections.html','marketing.html','fidelidade.html','equipe-360.html','auditoria.html','omnichannel.html','autopilot.html']: assert n in s
def test_assets():
    assert (R/'retail-os.css').stat().st_size>1000 and (R/'retail-os.js').stat().st_size>100
def test_html_closes():
    for p in R.glob('*.html'):
      s=p.read_text(encoding='utf-8',errors='ignore').lower(); assert '</html>' in s
