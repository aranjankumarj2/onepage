document.getElementById('year').textContent = (new Date).getFullYear();
const sT = document.getElementById('sidebarToggleButton'), cSB = document.getElementById('closeSidebarButton'), sE = document.getElementById('sidebar'), tNE = document.getElementById('topNav'), bVTE = document.getElementById('blog-title'), bVE = document.getElementById('blog-viewer'), mC = document.getElementById('mainContent'), gRBAU = 'https://api.github.com/repos/RanjanHQ/DimLight/contents/', bCF = ['Information', 'blank', 'blank'], bCC = {}, aC = null;
function oS() { sE.classList.add('open'); tNE.classList.add('show'); }
function cS() { sE.classList.remove('open'); tNE.classList.remove('show'); }
sT.addEventListener('click', e => { e.stopPropagation(); sE.classList.contains('open') ? cS() : oS(); });
cSB.addEventListener('click', e => { e.stopPropagation(); cS(); });
document.body.addEventListener('click', e => {
    const iCIS = sE.contains(e.target), iCOT = sT.contains(e.target);
    if (window.innerWidth <= 768 && sE.classList.contains('open') && !iCIS && !iCOT) {
        if (!tNE.contains(e.target)) cS();
    }
});
let tSX = 0, tEX = 0;
const sT_ = 50;
document.body.addEventListener('touchstart', e => { if (window.innerWidth <= 768) tSX = e.changedTouches[0].screenX; }, false);
document.body.addEventListener('touchend', e => {
    if (window.innerWidth <= 768) {
        tEX = e.changedTouches[0].screenX;
        const dX = tEX - tSX;
        if (dX > sT_ && !sE.classList.contains('open')) oS();
        else if (dX < -sT_ && sE.classList.contains('open')) cS();
    }
}, false);
async function fFC(rP) {
    const fAU = gRBAU + rP;
    try {
        const r = await fetch(fAU);
        if (!r.ok) throw new Error(`GitHub API error from ${fAU}: ${r.status} ${r.statusText}`);
        return await r.json();
    } catch (e) { console.error(`Error fetching folder contents from ${rP}:`, e); return []; }
}
async function fAPBP() {
    let aRF = [], aFD = await Promise.all(bCF.map(p => fFC(p)));
    aFD.forEach((fI, i) => {
        const fP = bCF[i];
        if (fP === 'ad') {
            const aF = fI.filter(item => (item.name.endsWith('.html') || item.name.endsWith('.txt') || item.name.endsWith('.mdx')) && item.type === 'file').sort((a, b) => {
                const eA = a.name.split('.').pop(), eB = b.name.split('.').pop(), eO = { 'html': 1, 'txt': 2, 'mdx': 3 };
                if (eO[eA] !== eO[eB]) return (eO[eA] || 99) - (eO[eB] || 99);
                return a.name.localeCompare(b.name);
            });
            if (aF.length > 0) {
                const aF_ = aF[0];
                if (!bCC[aF_.download_url]) {
                    fetch(aF_.download_url).then(r => r.text()).then(c => {
                        aC = (aF_.name.endsWith('.txt') || aF_.name.endsWith('.mdx')) ? `<pre style="white-space: pre-wrap; word-wrap: break-word;">${c}</pre>` : c;
                        bCC[aF_.download_url] = aC;
                    }).catch(e => console.error("Error fetching ad content:", e));
                } else aC = bCC[aF_.download_url];
            }
        } else aRF = aRF.concat(fI.filter(item => item.name.endsWith('.html') && item.type === 'file'));
    });
    const pBP = await Promise.all(aRF.map(async fD => {
        if (!bCC[fD.download_url]) {
            const hR = await fetch(fD.download_url);
            if (!hR.ok) { console.error(`Failed to fetch raw HTML for ${fD.download_url}: ${hR.status}`); return null; }
            bCC[fD.download_url] = await hR.text();
        }
        const hC = bCC[fD.download_url], dP = new DOMParser(), bD = dP.parseFromString(hC, 'text/html'), dTi = bD.querySelector('h1')?.textContent || bD.querySelector('title')?.textContent || fD.name.replace(/\.html$/, '').replace(/%20/g, ' '), fBTC = bD.body?.textContent || '', mKC = bD.querySelector('meta[name="keywords"]')?.content || '', aHET = Array.from(bD.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => h.textContent).join(' ');
        return { fileName: fD.name, postUrl: fD.download_url, displayTitle: dTi, rawHtmlContent: hC, searchableContent: `${bD.querySelector('title')?.textContent || ''} ${aHET} ${mKC} ${fBTC}`.toLowerCase() };
    }));
    return pBP.filter(p => p !== null);
}
function dRP(pTS) {
    const rPL = document.getElementById('recent-posts');
    rPL.innerHTML = '';
    if (pTS.length === 0) { rPL.innerHTML = '<li>No results found</li>'; return; }
    pTS.slice(0, 10).forEach(p => {
        const lI = document.createElement('li');
        lI.innerHTML = `<a href="#" data-url="${p.postUrl}">${p.displayTitle}</a>`;
        lI.querySelector('a').addEventListener('click', e => { e.preventDefault(); lBPITV(p.postUrl); });
        rPL.appendChild(lI);
    });
}
function lBPITV(pU) {
    bVE.style.backgroundColor = 'transparent';
    bVE.classList.remove('visible');
    const cHa = bCC[pU];
    if (cHa) {
        const dP = new DOMParser(), bD = dP.parseFromString(cHa, 'text/html'), bBC = bD.querySelector('body');
        bVE.innerHTML = '';
        if (bBC) {
            Array.from(bBC.children).forEach(n => {
                if (n.tagName === 'SCRIPT') {
                    const nS = document.createElement('script');
                    if (n.src) nS.src = n.src;
                    else nS.textContent = n.textContent;
                    bVE.appendChild(nS);
                } else bVE.appendChild(n.cloneNode(true));
            });
        }
        bVE.style.maxHeight = 'none';
        setTimeout(() => bVE.classList.add('visible'), 50);
    } else {
        bVE.innerHTML = '<p style="color:red">Failed to load blog post. Content not cached or an error occurred.</p>';
        bVE.classList.add('visible');
    }
}
document.getElementById('searchInput').addEventListener('input', async function () {
    const sT = this.value.toLowerCase().trim();
    if (!window.allLoadedBlogPosts || window.allLoadedBlogPosts.length === 0) window.allLoadedBlogPosts = await fAPBP();
    let fR = [];
    if (sT) {
        fR = window.allLoadedBlogPosts.filter(p => p.searchableContent && p.searchableContent.includes(sT));
        if (bVTE) bVTE.textContent = 'Search Results';
    } else {
        fR = window.allLoadedBlogPosts.slice(0, 10);
        if (bVTE) bVTE.textContent = 'Explore Latest';
    }
    dRP(fR);
});
(async () => {
    window.allLoadedBlogPosts = await fAPBP();
    dRP(window.allLoadedBlogPosts);
    if (aC) {
        if (bVE) {
            bVE.innerHTML = aC;
            bVE.classList.add('visible');
        }
    }
})();
const sTTB = document.getElementById("scrollToTopBtn");
mC.addEventListener("scroll", () => { sTTB.style.display = mC.scrollTop > 200 ? "block" : "none"; });
sTTB.addEventListener("click", () => { mC.scrollTo({ top: 0, behavior: "smooth" }); });
