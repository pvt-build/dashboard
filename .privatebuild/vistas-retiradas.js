/* Vistas que salieron del Business OS el 2026-09-21.
   No se borran: Contenido vive ahora en el Content OS, y Daily, Canales,
   Backend, Consultoría, Proyecciones, Radar y Tendencia quedaron fuera de
   la barra cuando el panel pasó a los 8 sistemas. Si alguna vuelve, se
   reinyecta desde acá con su CSS. */

  /* ── CONTENIDO · motor, formatos e ikigai ── */
  function vContenido(){
    var c=D.contenido, W=560, H=430, R=96;
    var cx=[W/2, W/2-74, W/2+74], cy=[168, 268, 268];
    var col=['var(--blue)','var(--gold)','var(--teal)'];
    var s='<svg class="ik-svg" viewBox="0 0 '+W+' '+H+'" role="img" '
      +'aria-label="Interseccion entre quien eres, que construyes y que paga el mercado">';
    for(var i=0;i<3;i++)
      s+='<circle class="ik-c" cx="'+cx[i]+'" cy="'+cy[i]+'" r="'+R+'" fill="'+col[i]
        +'" stroke="'+col[i]+'"/>';
    /* los pares se rotulan fuera del apilamiento, con línea guía */
    var pp=[[cx[1]-R-4, 196],[W/2, cy[1]+R+16],[cx[2]+R+4, 196]];
    var an=['end','middle','start'];
    c.pares.forEach(function(x,i){
      s+='<text class="ik-pair" x="'+pp[i][0]+'" y="'+pp[i][1]+'" text-anchor="'+an[i]+'">'
        +esc(x.n.toUpperCase())+'</text>';
    });
    /* etiquetas de cada círculo, bien separadas del dibujo */
    var lp=[[W/2,58],[cx[1]-R-10,cy[1]+R+52],[cx[2]+R+10,cy[2]+R+52]];
    var la=['middle','start','end'];
    c.circulos.forEach(function(x,i){
      s+='<text class="ik-lbl" x="'+lp[i][0]+'" y="'+lp[i][1]+'" text-anchor="'+la[i]+'">'
        +esc(x.k.toUpperCase())+'</text>'
        +'<text class="ik-sub" x="'+lp[i][0]+'" y="'+(lp[i][1]+16)+'" text-anchor="'+la[i]+'">'
        +esc(x.n)+'</text>';
    });
    /* el centro real de los tres círculos */
    var mx=W/2, my=(cy[0]+cy[1]+cy[2])/3;
    s+='<circle cx="'+mx+'" cy="'+my+'" r="40" fill="var(--bg)" opacity=".82"/>'
      +'<circle cx="'+mx+'" cy="'+my+'" r="40" fill="rgba(216,168,71,.22)" '
      +'stroke="var(--gold)" stroke-width="1.5"/>'
      +'<text class="ik-core" x="'+mx+'" y="'+(my-2)+'" text-anchor="middle">YO SOY</text>'
      +'<text class="ik-core" x="'+mx+'" y="'+(my+14)+'" text-anchor="middle">MI AVATAR</text></svg>';
    var side='<div class="ik-side"><div class="core"><b>'+esc(c.centro.n)+'</b><p>'
      +esc(c.centro.d)+'</p></div>'
      + c.pares.map(function(x){
          return '<div class="ik-p"><b>'+esc(x.n)+'</b><span>'+esc(x.d)+'</span></div>'; }).join('')
      + '</div>';

    /* la cadena como diagrama: fuente → gema → el carril se abre en dos
       cuentas → vuelven a juntarse en producción y terminan en el cierre */
    var cd=c.cadena, CR={};
    (cd.carriles||[]).forEach(function(x){ CR[x.k]=x; });
    var mh='<div class="note" style="margin:0 0 var(--s4)">'+esc(cd.lead)+'</div>';

    var nodo=function(x,cls){
      return '<div class="dg-n '+esc(x.e)+' '+(cls||'')+'" data-go-et="'+esc(x.i)+'">'
        +'<span class="dg-i">'+esc(x.i)+'</span>'
        +'<b>'+esc(x.n)+'</b><em>'+esc(x.k)+'</em>'
        +'<u>'+esc(x.quien)+'</u></div>';
    };
    var ix={}; cd.etapas.forEach(function(x){ ix[x.i]=x; });

    mh+='<div class="dg">';
    /* tramo 1 — la fuente y la gema, una sola vía */
    mh+='<div class="dg-fila"><div class="dg-lbl">Entra</div><div class="dg-row">'
      + nodo(ix['01']) + '<i class="dg-fl"></i>' + nodo(ix['02']) + '<i class="dg-fl"></i>'
      + nodo(ix['03'],'dg-fork') + '</div></div>';

    /* tramo 2 — el carril se parte: una columna por cuenta */
    mh+='<div class="dg-fila split"><div class="dg-lbl">Se parte</div><div class="dg-lanes">';
    (cd.carriles||[]).forEach(function(cl){
      mh+='<div class="dg-lane" style="--c:'+esc(cl.c)+'">'
        +'<div class="dg-lh"><b>'+esc(cl.n)+'</b><span>'+esc(cl.h)+'</span>'
        +'<em>'+esc(cl.voz)+'</em></div>'
        +'<div class="dg-lr">'+esc(cl.rol)+'</div>'
        +'<div class="dg-hk">'+cl.hooks.map(function(h){
            return '<div class="hk"><div class="hk-t">'+esc(h.h)+'</div>'
              +'<div class="hk-g">'+esc(h.g)+'</div></div>'; }).join('')+'</div>'
        +'<div class="dg-pz">'+(cl.piezas||[]).map(function(k){
            return PZ[k]?'<img src="'+PZ[k]+'" alt="'+esc(k)+'" loading="lazy">':''; }).join('')
        +'</div></div>';
    });
    mh+='</div></div>';

    /* tramo 3 — vuelven a juntarse y terminan en el cierre */
    mh+='<div class="dg-fila"><div class="dg-lbl">Se junta</div><div class="dg-row">'
      + ['06','07','08'].map(function(k){ return nodo(ix[k]); }).join('<i class="dg-fl"></i>')
      + '</div></div>';
    mh+='<div class="dg-fila"><div class="dg-lbl">Cierra</div><div class="dg-row">'
      + ['09','10','11'].map(function(k){ return nodo(ix[k],'dg-cl'); }).join('<i class="dg-fl"></i>')
      + '</div></div>';
    mh+='</div>';
    mh+='<div class="loop">↻ &nbsp;<b>El ciclo se cierra:</b> '+esc(cd.loop)+'</div>';

    /* la ficha de cada etapa, abajo del diagrama */
    mh+='<div class="cad-l">';
    cd.etapas.forEach(function(x){
      mh+='<details class="ce '+esc(x.e)+'"><summary>'
        +'<span class="ce-i">'+esc(x.i)+'</span>'
        +'<span class="ce-n">'+esc(x.n)+'<em>'+esc(x.k)+'</em></span>'
        +'<span class="ce-p">'+(x.pl||[]).map(function(k){return logo(k);}).join('')+'</span>'
        +'<span class="ce-w">'+esc(x.quien)+'</span>'
        +'<span class="ce-s">'+({live:'corre',mid:'a medias',brk:'roto'}[x.e]||'')+'</span>'
        +'<span class="ce-cv">›</span></summary>'
        +'<div class="ce-b">'
        +'<div class="ce-f"><b>Qué pasa acá</b><p>'+esc(x.q)+'</p></div>'
        +'<div class="ce-f ej"><b>Ejemplo real</b><p>'+esc(x.ej)+'</p></div>'
        +'<div class="ce-f sk"><b>Con qué skill</b><p>'+esc(x.skill)+'</p></div>'
        +'<div class="ce-f dn"><b>Si se tranca, se ajusta en</b><p>'+esc(x.donde)+'</p></div>'
        +'<div class="ce-f ft"><b>Qué falta</b><p>'+esc(x.falta)+'</p></div>'
        +'</div></details>';
    });
    mh+='</div><div class="concl"><b>Conclusión</b>'+esc(cd.concl)+'</div>';

    /* el catálogo: ángulos, ADN del hook, formatos y banco de piezas */
    var ct2=c.catalogo;
    var kh='<div class="note" style="margin:0 0 var(--s4)">'+esc(ct2.lead)+'</div>';

    kh+='<div class="card-t">Los tres ángulos — qué hace cada uno</div><div class="ang">';
    ct2.angulos.forEach(function(a){
      kh+='<div class="ang-c" style="--c:'+esc(a.c)+'">'
        +'<div class="ang-h"><span class="ang-k">'+esc(a.k)+'</span>'
        +'<b>'+esc(a.n)+'</b></div>'
        +'<p class="ang-q">'+esc(a.q)+'</p>'
        +'<div class="ang-f"><i>Reacción</i>'+esc(a.reaccion)+'</div>'
        +'<div class="ang-f"><i>Efecto</i>'+esc(a.efecto)+'</div>'
        +'<div class="ang-f"><i>A quién</i>'+esc(a.avatar)+'</div>'
        +'<div class="ang-f"><i>CTA</i>'+esc(a.cta)+'</div>'
        +'<div class="ang-e">'+a.ej.map(function(x){
            return '<span>'+esc(x)+'</span>'; }).join('')+'</div>'
        +'<div class="ang-p">'+(a.piezas||[]).map(function(k){
            return PZ[k]?'<img src="'+PZ[k]+'" alt="" loading="lazy">':''; }).join('')+'</div>'
        +'</div>';
    });
    kh+='</div><div class="concl"><b>Conclusión</b>'+esc(ct2.ang_concl)+'</div>';

    kh+='<div class="card-t" style="margin-top:var(--s6)">El ADN del gancho — los 4 genes</div>';
    kh+='<div class="gen">'+ct2.genes.map(function(g,i){
      return '<div class="gen-c"><div class="gen-i">GEN '+(i+1)+'</div>'
        +'<b>'+esc(g.n)+'</b><div class="gen-f">'+esc(g.f)+'</div>'
        +'<div class="gen-q">'+esc(g.q)+'</div>'
        +'<div class="gen-e">'+esc(g.ej)+'</div></div>'; }).join('')+'</div>';
    kh+='<div class="card-t" style="margin-top:var(--s5)">Los 5 deseos raíz — uno es débil, dos es fuerte</div>';
    kh+='<div class="des">'+ct2.deseos.map(function(x){
      return '<div style="--c:'+esc(x.c)+'"><i></i><b>'+esc(x.n)+'</b>'
        +'<span>'+esc(x.s)+'</span></div>'; }).join('')+'</div>';
    kh+='<div class="concl"><b>Conclusión</b>'+esc(ct2.gen_concl)+'</div>';

    kh+='<div class="card-t" style="margin-top:var(--s6)">Los formatos y su ejemplo</div>';
    kh+='<div class="fmx">'+ct2.formatos.map(function(f){
      return '<div class="fmx-c '+esc(f.e)+'">'
        +(f.pieza&&PZ[f.pieza]?'<img src="'+PZ[f.pieza]+'" alt="" loading="lazy">'
          :'<div class="fmx-nil">sin pieza<br>todavía</div>')
        +'<div class="fmx-b"><div class="fmx-h">'+logo(f.p)+'<b>'+esc(f.n)+'</b>'
        +'<u>'+f.min+' min</u></div>'
        +'<p>'+esc(f.q)+'</p>'
        +'<div class="fmx-f"><span>'+esc(f.cad)+'</span><span>CTA · '+esc(f.cta)+'</span></div>'
        +'<div class="fmx-e">'+esc(f.estado)+'</div></div></div>'; }).join('')+'</div>';
    kh+='<div class="concl"><b>Conclusión</b>'+esc(ct2.fmt_concl)+'</div>';

    var bk2=ct2.banco;
    kh+='<div class="card-t" style="margin-top:var(--s6)">El banco — '+bk2.producido.length
      +' producidas, '+bk2.pendiente.length+' por construir</div>';
    kh+='<div class="bnc">'+bk2.producido.map(function(x){
      return '<div class="bnc-c">'+(PZ[x.k]?'<img src="'+PZ[x.k]+'" alt="" loading="lazy">':'')
        +'<div class="bnc-n">'+esc(x.n)+'</div>'
        +'<div class="bnc-a a'+esc(x.a)+'">'+esc(x.a)+'</div></div>'; }).join('')+'</div>';
    kh+='<div class="pnd">'+bk2.pendiente.map(function(x){
      return '<div class="pnd-c"><span class="bnc-a a'+esc(x.a)+'">'+esc(x.a)+'</span>'
        +'<b>'+esc(x.n)+'</b><u class="p'+esc(x.p)+'">'+esc(x.p)+'</u></div>'; }).join('')+'</div>';
    kh+='<div class="concl"><b>Conclusión</b>'+esc(bk2.concl)+'</div>'
      +'<div class="note">'+esc(ct2.nota)+'</div>'
      +'<div class="tm-src">Fuente: '+esc(ct2.fuente)+'</div>';

    /* formatos y su cadencia */
    var fh='';
    (c.formatos||[]).forEach(function(f){
      var pc=Math.round(f.hecho/f.meta*100);
      fh+='<div class="fmt"><div class="fmt-n">'+esc(f.n)
        +'<span>'+logo(f.p)+esc(f.p)+'</span></div>'
        +'<div class="fmt-c">'+esc(f.cad)+'</div>'
        +'<div class="fmt-b'+(f.e==='brk'?' brk':'')+'"><i style="width:'+Math.max(pc,f.hecho?4:0)+'%"></i></div>'
        +'<div class="fmt-v'+(f.e==='brk'?' brk':'')+'">'+f.hecho+' / '+f.meta+'</div>'
        +'<div class="k2">'+esc(f.r)+'</div></div>';
    });

    return vhead('Contenido','el motor',c.lectura)
      + tiles(c.prod.stats)
      + '<div class="stack">'
      + card(esc(cd.t), mh)
      + card(esc(c.catalogo.t), kh)
      + card('Los cinco formatos y su cadencia',
             fh + '<div class="concl"><b>Conclusión</b>'+esc(c.prod.concl)+'</div>')
      + card('Hacia qué salidas', (function(){
          var sh='<div class="sal">';
          (c.salidas||[]).forEach(function(x){
            sh+='<div class="sal-c '+(x.e==='brk'?'brk':'')+'">'
              +'<div class="sal-n">'+esc(x.n)+'</div><div class="sal-d">'+esc(x.d)+'</div>'
              +'<div class="sal-v">'+x.act+' / '+x.tot+'</div>'
              +'<div class="sal-r">'+esc(x.r)+'</div></div>';
          });
          return sh+'</div>';
        })())
      + card(esc(c.cuentas.t), (function(){
          var q='<div class="cta">'+c.cuentas.bloques.map(function(b){
            return '<div class="cta-c '+esc(b.e)+'"><div class="cta-h"><b>'+esc(b.c)+'</b>'
              +'<span>'+esc(b.h)+'</span></div>'
              +'<div class="cta-p">'+esc(b.para)+'</div>'
              + b.items.map(function(i){
                  return '<div class="cta-i"><b>'+esc(i.n)+'</b>'
                    +'<div class="q">'+esc(i.q)+'</div>'
                    +'<div class="w">'+esc(i.por)+'</div></div>'; }).join('')
              +'</div>'; }).join('')+'</div>';
          return q+'<div class="regla">'+esc(c.cuentas.regla)+'</div>'
            +'<div class="errr">'+esc(c.cuentas.error)+'</div>';
        })())
      + card(esc(c.mes.t), (function(){
          var m=c.mes, h='<div class="lv-h"><span>Formato</span><span>CTA</span>'
            +'<span>Cuenta</span><span>Minutos</span><span>Del mes</span><span>Estado</span></div>';
          m.filas.forEach(function(f){
            h+='<div class="lv '+esc(f.e)+'"><div class="k1">'+esc(f.f)+'</div>'
              +'<div class="lv-b">'+esc(f.cta)+'</div>'
              +'<div class="k2">'+esc(f.cuenta)+'</div>'
              +'<div class="lv-v">'+f.min+'′</div>'
              +'<div class="lv-v">'+f.hechas+' / '+f.meta+'</div>'
              +'<div class="lv-b">'+(f.e==='live'?'corre':'sin montar')+'</div></div>';
          });
          return h+'<div class="concl"><b>Conclusión</b>'+esc(m.concl)+'</div>';
        })())
      + card(esc(c.comunidad.t), (function(){
          var cm=c.comunidad, h='<div class="note" style="margin:0 0 var(--s4)">🔒 '
            +esc(cm.canal)+' — '+esc(cm.estado)+'</div>';
          cm.filas.forEach(function(f){
            h+='<div class="ins"><div class="ins-a">'+esc(f.d)+'</div>'
              +'<div class="k2" style="color:var(--hi)">'+esc(f.q)+'</div>'
              +'<div class="k2">'+esc(f.por)+'</div></div>';
          });
          return h+'<div class="concl"><b>Conclusión</b>'+esc(cm.concl)+'</div>';
        })())
      + card('Dónde apunta — los tres territorios',
             '<div class="ik-wrap"><div>'+s+'</div>'+side+'</div>')
      + '</div>' + skArea('contenido');
  }


  /* ── DAILY · el ritmo ── */
  function vDaily(){
    var D_=D.daily, rt='<div class="rit">';
    D_.ritmos.forEach(function(r){
      rt+='<div class="rit-c '+esc(r.e)+'"><div class="rit-h"><b>'+esc(r.c)+'</b>'
        +'<span>'+r.n+'</span></div>'
        +'<div class="note" style="margin:0 0 var(--s3)">'+esc(r.why||'')+'</div>';
      r.items.forEach(function(i){
        rt+='<div class="rit-i '+esc(i.k||'')+'"><div class="q">'+i.w+'</div>'
          +'<div class="t">'+esc(i.n)
          +'<div class="k3" style="font-weight:400;margin-top:2px">'+esc(i.why||'')+'</div></div>'
          +'<div class="a">'+esc(i.a)+'</div></div>';
      });
      rt+='</div>';
    });
    rt+='</div>';

    /* calendario del mes: se genera desde los días declarados, no a mano */
    var cl=D_.cal;
    var hoy=new Date(D.meta.iso||Date.parse('2026-08-31'));
    if(isNaN(hoy)) hoy=new Date();
    var Y=hoy.getFullYear(), M=hoy.getMonth(), DHOY=hoy.getDate();
    var MES=['enero','febrero','marzo','abril','mayo','junio','julio','agosto',
      'septiembre','octubre','noviembre','diciembre'][M];
    var ndias=new Date(Y,M+1,0).getDate();
    var off=(new Date(Y,M,1).getDay()+6)%7;   /* la semana parte el lunes */

    var COLA={}; (D_.areas||[]).forEach(function(a){ COLA[a.k]=a; });
    var leg='<div class="alg">'+(D_.areas||[]).map(function(a){
      return '<span><i style="background:'+esc(a.c)+'"></i>'+esc(a.n)+'</span>'; }).join('')+'</div>';

    var sm='<div class="note" style="margin:0 0 var(--s4)">'+esc(cl.lead)+'</div>'+leg;
    sm+='<div class="cal-t">'+MES+' '+Y+'</div>';
    sm+='<div class="cal">'
      + ['lun','mar','mié','jue','vie','sáb','dom'].map(function(x){
          return '<div class="cal-h">'+x+'</div>'; }).join('');
    for(var i=0;i<off;i++) sm+='<div class="cal-d off"></div>';
    for(var dd=1;dd<=ndias;dd++){
      var wd=(new Date(Y,M,dd).getDay()+6)%7;
      var hoyes=(dd===DHOY);
      var bl=cl.bloques.filter(function(b){ return b.dias.indexOf(wd)>=0; });
      var mins=bl.reduce(function(a,b){ return a+b.min; },0);
      var fin=(wd>=5);
      sm+='<div class="cal-d'+(hoyes?' hoy':'')+(fin?' fin':'')+'">'
        +'<div class="cal-n">'+dd+(hoyes?'<b>hoy</b>':'')
        +'<u>'+(mins>=60?(mins/60).toFixed(1).replace('.0','')+' h':mins+' m')+'</u></div>'
        + bl.map(function(b){
            var c=(COLA[b.k]||{}).c||'var(--mid)';
            return '<div class="cal-b" style="--c:'+esc(c)+'">'
              +'<i></i>'+esc(b.n)+'</div>'; }).join('')
        +'</div>';
    }
    sm+='</div><div class="concl"><b>Conclusión</b>'+esc(cl.concl)+'</div>';

    var br=D_.cumpl, bh='';
    br.filas.forEach(function(f){
      bh+='<div class="rw rw-sy"><span class="dot '+esc(f.e)+'"></span>'
        +'<div class="k1">'+esc(f.n)+'</div><div class="k2">'+esc(f.d)+'</div>'
        +'<div class="k3">'+(f.e==='live'?'existe':'falta')+'</div></div>';
    });
    bh+='<div class="concl"><b>Conclusión</b>'+esc(br.concl)+'</div>';

    return vhead('Daily','el ritmo del negocio',D_.lectura)
      + tiles(D_.stats)
      + '<div class="stack">'
      + card('Las cadencias', rt)
      + card(esc(cl.t), sm)
      + card(esc(br.t), '<div class="note" style="margin:0 0 var(--s4)">'+esc(br.estado)+'</div>'+bh)
      + '</div>' + skArea('daily');
  }


  /* ── CANALES ── */
  function vCanales(){
    var c=D.canales;
    var pies='<div class="pies">'+torta(c.torta_leads,'Leads por canal')
      +torta(c.torta_clientes,'Clientes por canal')+'</div>'
      +'<div class="note">La misma proporción no se sostiene: la red trae 74% de los leads '
      +'y 82% de los clientes; Instagram trae 22% de los leads y 9% de los clientes.</div>';

    var m=c.mensual;
    var barras=barrasV(m.meses.map(function(mm,i){
        var o={m:mm}; m.series.forEach(function(se,j){ o['s'+j]=se.v[i]; }); return o; }),
      m.series.map(function(se,j){ return {k:'s'+j, n:se.n, c:'gold'}; }),
      {alt:'Leads por canal y mes'});
    /* color propio por serie */
    m.series.forEach(function(se,j){
      barras=barras.replace(new RegExp('var\\(--gold\\)','g'), function(x){return x;});
    });

    var lv=c.leverage, lh='<div class="lv-h"><span>Canal</span><span>Conv.</span>'
      +'<span>Esfuerzo</span><span>Ticket</span><span>Leverage</span><span>Por qué</span></div>';
    lv.filas.forEach(function(f){
      lh+='<div class="lv '+esc(f.e)+'"><div class="k1">'+esc(f.n)+'</div>'
        +'<div class="lv-v">'+f.conv+'%</div>'
        +'<div class="lv-b">'+esc(f.esf)+'</div>'
        +'<div class="lv-v">'+(f.tk?'$'+money(f.tk):'—')+'</div>'
        +'<div class="lv-b">'+esc(f.lev)+'</div>'
        +'<div class="k2">'+esc(f.d)+'</div></div>';
    });
    lh+='<div class="concl"><b>Conclusión</b>'+esc(lv.concl)+'</div>';

    var rows='';
    c.lista.forEach(function(x){
      var ini={red:'RP',ref:'RF',ig:'IG',web:'WB',scr:'SC'}[x.ic]||'··';
      var lg=logo(x.ic);
      rows+='<div class="cn'+(x.nuevo?' hot':'')+'">'
        +'<div class="cn-top2">'
        + (lg ? '<div class="lg img">'+logo(x.ic,'big')+'</div>'
              : '<div class="lg" style="background:'+esc(x.color)+'">'+ini+'</div>')
        +'<div class="nm"><b>'+esc(x.n)+'</b><span>'+esc(x.cuello)+'</span></div>'
        +'<div class="cn-nums">'
        +'<div class="cn-num"><b>'+x.leads+'</b><span>leads</span></div>'
        +'<div class="cn-num"><b>'+x.cli+'</b><span>clientes</span></div>'
        +'<div class="cn-num"><b class="'+(x.tasa>=50?'s-live':x.tasa>=30?'':'s-brk')+'">'
        +x.tasa+'%</b><span>conv '+delta(x.delta)+'</span></div>'
        +'<div class="cn-num"><b>'+(x.tk?'$'+money(x.tk):'—')+'</b><span>ticket</span></div>'
        +'</div></div>'
        +'<div class="cn-txt"><div><b>Por qué pasó</b><p>'+esc(x.por)+'</p></div>'
        +'<div><b>Qué hacer</b><p>'+esc(x.acc)+'</p></div></div></div>';
    });
    return vhead('Canales','de dónde viene cada uno',c.lectura)
      + tiles(c.stats)
      + '<div class="stack">'
      + card('Cada canal, sus números y qué hacer', rows)
      + card('Distribución — leads contra clientes', pies)
      + card(esc(m.t), barras+'<div class="concl"><b>Conclusión</b>'+esc(m.concl)+'</div>')
      + card(esc(lv.t), lh)
      + '</div>' + skArea('canales');
  }


  /* ── BACKEND ── */
  function vBackend(){
    var B=D.backend;

    /* el árbol: sistema → agente → skill → acción.
       Del dato solo salen hechos; leverage y veredicto se derivan acá. */
    var BK={}; (B.areas||[]).forEach(function(x){ BK[x.a]=x; });
    var T=B.tiempo, AH=0, CO=0, HU=0, NA=0, SM=0, ACC=0, AUTO=0, SINM=0;
    var hrs=function(m){ return m>=60 ? (m/60).toFixed(1).replace('.0','')+' h' : m+' min'; };
    var ver=function(a){
      var u=a.manual-a.min, am=u*a.frec;
      if(a.frec===0) return {v:'humo', am:0, cm:0, u:u};
      if(u<=0)       return {v:'cuesta', am:am, cm:a.min*a.frec, u:u};
      if(am<30)      return {v:'marginal', am:am, cm:a.min*a.frec, u:u};
      return {v:'ahorra', am:am, cm:a.min*a.frec, u:u};
    };
    var lev=function(am){ return am>=180?'alto':am>=60?'medio':am>0?'bajo':'nulo'; };

    T.arbol.forEach(function(x){
      x._ah=0; x._acc=0; x._humo=0;
      x.skills.forEach(function(k){
        k._ah=0;
        k.acciones.forEach(function(a){
          var r=ver(a); a._=r; a._lev=lev(r.am);
          k._ah+=r.am; x._ah+=r.am; x._acc++; ACC++;
          AH+=r.am; CO+=r.cm;
          if(r.v==='humo'){ HU++; x._humo++; }
          if(a.auto==='auto') AUTO++;
          if(a.met==='—') SINM++;
        });
      });
      SM+=x.skills.length;
      if(x.agente==='auto') NA++;
    });

    var th='<div class="note" style="margin:0 0 var(--s4)">'+esc(T.lead)+'</div>';
    th+='<div class="via"><span>Sistema</span><i></i><span>Agente</span><i></i>'
      +'<span>Skill</span><i></i><span>Acción</span>'
      +'<b>tiempo · leverage · métrica · qué falta</b></div>';
    th+='<div class="tsum">'
      +'<div class="ok"><b>'+hrs(AH).replace(' h','<span> h</span>')+'</b>'
      +'<span>Ahorro al mes</span></div>'
      +'<div><b>'+hrs(CO).replace(' h','<span> h</span>')+'</b>'
      +'<span>Lo que cuesta correrlo</span></div>'
      +'<div class="ok"><b>'+(Math.round(AH/(CO||1)*10)/10)+'<span>×</span></b>'
      +'<span>Retorno por hora</span></div>'
      +'<div><b>'+AUTO+'<span> / '+ACC+'</span></b><span>Acciones automáticas</span></div>'
      +'<div class="no"><b>'+HU+'<span> / '+ACC+'</span></b><span>Acciones en humo</span></div>'
      +'<div class="no"><b>'+SINM+'<span> / '+ACC+'</span></b><span>Sin métrica</span></div>'
      +'</div>';

    var maxS=Math.max.apply(null,T.arbol.map(function(x){return x._ah}))||1;
    T.arbol.forEach(function(x,i){
      var ag={auto:'Corre solo',semi:'Asistido',mano:'A pulso'}[x.agente]||x.agente;
      th+='<details class="sy '+esc(x.agente)+'"><summary>'
        +'<span class="sy-i">'+(i<9?'0':'')+(i+1)+'</span>'
        +'<span class="sy-n">'+esc(x.a)+'<em>'+esc(x.sis)+'</em></span>'
        +'<span class="sy-ag '+esc(x.agente)+'">'+esc(ag)+'</span>'
        +'<span class="sy-c">'+x.skills.length+'<i>skills</i></span>'
        +'<span class="sy-c">'+x._acc+'<i>acciones</i></span>'
        +'<span class="sy-b"><i style="width:'+Math.round(x._ah/maxS*100)+'%"></i></span>'
        +'<span class="sy-ah'+(x._ah?'':' nil')+'">'+(x._ah?hrs(x._ah):'nada')+'</span>'
        +'<span class="sy-u '+esc(x.urg)+'">'+esc(x.urg)+'</span>'
        +'<span class="sy-cv">›</span></summary><div class="sy-b2">';

      var fa=BK[x.a]||{};
      var mk=function(l,v){ var c=(v==='Listo'||v==='Auto'||v==='Escrito')?'ok'
        :(v==='Parcial'||v==='Semi')?'mid':'no';
        return '<span><i>'+l+'</i><b class="'+c+'">'+esc(v||'—')+'</b></span>'; };
      th+='<div class="sy-fa">'
        + mk('SOP escrito', fa.sop) + mk('Transferible a cliente', fa.transf)
        + '<span class="con"><i>Corre con</i><div>'
        + (fa.con||[]).map(chip).join('')+'</div></span></div>';

      x.skills.forEach(function(k){
        th+='<details class="sk2"><summary>'
          +'<span class="sk2-n">'+esc(k.id)+'</span>'
          +'<span class="sk2-r">'+esc(k.rol)+'</span>'
          +'<span class="sk2-c">'+k.acciones.length+'<i>acc</i></span>'
          +'<span class="sk2-ah'+(k._ah?'':' nil')+'">'+(k._ah?hrs(k._ah):'—')+'</span>'
          +'<span class="sk2-cv">›</span></summary><div class="ac-w">';
        k.acciones.forEach(function(a){
          th+='<div class="ac '+esc(a._.v)+'">'
            +'<div class="ac-n">'+esc(a.n)+'</div>'
            +'<div class="ac-t"><b>'+a.min+'</b><span>min</span>'
              +'<u>'+(a.frec?'× '+a.frec+' al mes':'nunca')+'</u></div>'
            +'<div class="ac-t dim"><b>'+a.manual+'</b><span>min a mano</span></div>'
            +'<div class="ac-l lv-'+esc(a._lev)+'">'+esc(a._lev)
              +'<u>'+(a._.v==='humo'?'humo':hrs(a._.am))+'</u></div>'
            +'<div class="ac-im '+esc(a.imp)+'">'+esc(a.imp)+'</div>'
            +'<div class="ac-au '+esc(a.auto)+'">'
              +({auto:'automático',semi:'asistido',mano:'a mano'}[a.auto]||a.auto)+'</div>'
            +'<div class="ac-m'+(a.met==='—'?' nil':'')+'">'
              +(a.met==='—'?'sin métrica':esc(a.met))+'</div>'
            +'<div class="ac-f"><b>Para automatizar</b>'+esc(a.falta)+'</div>'
            +'</div>';
        });
        th+='</div></details>';
      });
      th+='</div></details>';
    });

    th+='<div class="note">'+esc(T.aviso)+'</div>'
      +'<div class="concl"><b>Conclusión</b>'+esc(T.concl)+'</div>'
      +'<div class="tm-src">Fuente: '+esc(T.fuente)+'</div>';

    return vhead('Backend','área, sistema y tiempo',B.lectura)
      + tiles(B.stats)
      + '<div class="stack">'
      + card(esc(B.tiempo.t), th)
      + card('El arsenal completo','<div class="lk"><a class="lk-c" href="https://pvt-build.github.io/arsenal/" '
          +'target="_blank" rel="noopener"><div class="lk-n">El arsenal ↗</div>'
          +'<div class="lk-d">Para explicar el sistema, no para copiarlo</div></a></div>')
      + '</div>' + skArea('backend');
  }


  /* ── CONSULTORÍA ── */
  function vConsultoria(){
    var C=D.consultoria, fi='<div class="cfg">';
    (C.fichas||[]).forEach(function(x){
      var pc=Math.round(x.ses/x.tot*100);
      fi+='<div class="cf '+esc(x.e)+'">'
        +'<div class="cf-hd"><span class="dot '+esc(x.e)+'"></span>'
        +'<div><div class="cf-n">'+esc(x.n)+'</div>'
        +'<div class="cf-meta">'+esc(x.nicho)+'</div></div></div>'

        +'<div class="cf-pg"><div class="cf-ses">'+x.ses
        +'<span> / '+x.tot+' sesiones</span></div>'
        +'<div class="cf-est">'+esc(x.est)+'</div>'
        +'<div class="cf-bar"><i style="width:'+pc+'%"></i></div>'
        +'<div class="cf-rit">'+esc(x.dia)+' · '+esc(x.ritmo)+'</div></div>'

        + radarMini(x.radar, C.ejes)
        +'<div class="cf-rl">sus 8 sistemas · qué tan armado está cada uno</div>'

        +'<div class="cf-key"><b>Dónde apretar ahora</b><p>'+esc(x.apretar)+'</p></div>'
        + (x.bloqueo?'<div class="cf-bl"><b>Bloqueo</b>'+esc(x.bloqueo)+'</div>':'')

        +'<details class="cf-mas"><summary>El detalle de este cliente<span>›</span></summary>'
        +'<div class="cf-f"><b>Crecimiento acumulado</b><p>'+esc(x.crec)+'</p></div>'
        +'<div class="cf-f"><b>Qué logró</b><p>'+esc(x.logro)+'</p></div>'
        +'<div class="cf-f"><b>Qué mejorar de mi lado</b><p>'+esc(x.mejorar)+'</p></div>'
        +'</details>'
        +'<a class="cf-go" href="'+esc(x.url)+'" target="_blank" rel="noopener">Ver su panel ↗</a>'
        +'</div>';
    });
    fi+='</div>';

    var cu=C.cuello, ch='';
    cu.filas.forEach(function(f){
      ch+='<div class="rw rw-sy"><span class="dot '+esc(f.e)+'"></span>'
        +'<div class="k1">'+esc(f.n)+'</div><div class="k3">'+esc(f.c)+'</div>'
        +'<div class="k2">'+esc(f.d)+'</div></div>';
    });
    var rp='<div class="card-t" style="margin-top:var(--s5)">Lo que se repite en los tres</div>';
    cu.repite.forEach(function(f){
      rp+='<div class="og"><div><div class="k1">'+esc(f.n)+'</div>'
        +'<div class="og-bar"><i class="'+(f.v>=3?'brk':'')+'" style="width:'
        +Math.round(f.v/3*100)+'%"></i></div></div>'
        +'<div class="og-v '+(f.v>=3?'brk':'')+'">'+f.v+'/3</div>'
        +'<div class="k2">'+esc(f.d)+'</div></div>';
    });
    var pr='<div class="card-t" style="margin-top:var(--s5)">Pendientes míos, no del cliente</div>';
    cu.propios.forEach(function(f,i){
      pr+='<div class="gp '+esc(f.e)+'"><div class="gp-p">'+(i+1)+'</div>'
        +'<div class="k1">'+esc(f.n)+'</div><div class="k2"></div><div class="gp-d"></div></div>';
    });
    ch+=rp+pr+'<div class="concl"><b>Conclusión</b>'+esc(cu.concl)+'</div>';

    var t=C.tesis;
    return vhead('Consultoría','entrega y producto',C.lectura)
      + tiles(C.stats)
      + '<div class="stack">'
      + card('Los tres — sus 8 sistemas, dónde apretar y qué mejorar', fi)
      + card(esc(cu.t), ch)
      + card('La tesis de la entrega','<div class="tesis"><b>'+esc(t.t)+'</b><p>'+esc(t.d)+'</p>'
          +'<div class="cs2">'+esc(t.d2)+'</div>'
          +'<div class="cns">'+esc(t.conse)+'</div></div>')
      + '</div>' + skArea('consultoria');
  }


  /* ── PROYECCIONES ── */
  function vProyecciones(){
    var P=D.proyecciones;
    var max=Math.max.apply(null,P.escalones.map(function(e){return e.rev}))||1, el='';
    P.escalones.forEach(function(e){
      el+='<div class="esl"><div class="esl-n">'+esc(e.n)
        +'<span>'+e.calls+' calls · '+e.cp+'% · $'+money(e.tk)+'</span></div>'
        +'<div class="esl-t '+esc(e.e)+'"><i style="width:'+Math.round(e.rev/max*100)+'%"></i></div>'
        +'<div class="esl-r">$'+money(e.rev)+'</div>'
        +'<div class="esl-d">'+(e.delta?'+$'+money(e.delta)+'<span>suma</span>':'<span>base</span>')+'</div></div>';
    });
    var ph='<div class="pal-h"><span>Palanca</span><span>Tipo</span><span>Esfuerzo</span>'
      +'<span>Impacto/mes</span><span>Qué es</span></div>';
    P.palancas.forEach(function(x){
      ph+='<div class="pal"><div class="k1">'+esc(x.n)+'</div>'
        +'<div class="pal-b">'+esc(x.t)+'</div>'
        +'<div class="pal-b">'+esc(x.esf)+'</div>'
        +'<div class="pal-i'+(x.imp?'':' zero')+'">'+(x.imp?'+$'+money(x.imp):'—')+'</div>'
        +'<div class="k2">'+esc(x.d)+'</div></div>';
    });
    return vhead('Proyecciones','qué pasa si mueves palancas',P.lectura)
      + tiles(P.stats)
      + '<div class="stack">'
      + card('Los escalones, acumulados de arriba hacia abajo',
             el + '<div class="note">'+esc(P.nota)+'</div>')
      + card('Cada palanca por separado', ph
             + '<div class="note">El modelo es uno solo: '+esc(P.modelo)+'.</div>')
      + '</div>' + skArea('proyecciones');
  }


  /* ── RADAR ── */
  function vRadar(){
    var r=D.radar, ejes=r.areas, W=430, C=W/2, R=W*.31, N=ejes.length, PX=64, PY=12;
    var pt=function(i,v){ var a=-Math.PI/2+i*2*Math.PI/N;
      return [C+Math.cos(a)*R*v, C+Math.sin(a)*R*v]; };
    var poly=function(vals){ return vals.map(function(v,i){
      var p=pt(i,v); return p[0].toFixed(1)+','+p[1].toFixed(1); }).join(' '); };
    var s='<svg class="radar-svg" viewBox="'+(-PX)+' '+(-PY)+' '+(W+PX*2)+' '+(W+PY*2)+'" '
      +'role="img" aria-label="Radar de areas: hoy contra objetivo">';
    [.25,.5,.75,1].forEach(function(v){
      s+='<polygon class="rx-grid" points="'+poly(ejes.map(function(){return v}))+'"/>'; });
    ejes.forEach(function(_,i){ var p=pt(i,1);
      s+='<line class="rx-spoke" x1="'+C+'" y1="'+C+'" x2="'+p[0].toFixed(1)+'" y2="'+p[1].toFixed(1)+'"/>'; });
    s+='<polygon class="rx-target" points="'+poly(ejes.map(function(e){return e.t}))+'"/>';
    s+='<polygon class="rx-now" points="'+poly(ejes.map(function(e){return e.v}))+'"/>';
    ejes.forEach(function(e,i){
      var p=pt(i,e.v), brk=(e.t-e.v)>=.45;
      s+='<circle class="rx-dot'+(brk?' brk':'')+'" cx="'+p[0].toFixed(1)+'" cy="'+p[1].toFixed(1)+'" r="'+(brk?4:3)+'"/>';
      var lp=pt(i,1.30), a=-Math.PI/2+i*2*Math.PI/N, cx=Math.cos(a);
      var an=Math.abs(cx)<.25?'middle':(cx>0?'start':'end');
      s+='<text class="rx-lbl" x="'+lp[0].toFixed(1)+'" y="'+lp[1].toFixed(1)+'" text-anchor="'+an+'">'+esc(e.n.toUpperCase())+'</text>'
        +'<text class="rx-val '+esc(e.e)+'" x="'+lp[0].toFixed(1)+'" y="'+(lp[1]+11).toFixed(1)+'" text-anchor="'+an+'">'
        +Math.round(e.v*100)+'<tspan class="rx-obj"> / '+Math.round(e.t*100)+'</tspan></text>';
    });
    s+='</svg>';
    var ar='';
    /* el sistema y el agente vienen del backend: una sola fuente por área */
    var BK={}; (D.backend.areas||[]).forEach(function(x){ BK[x.a]=x; });
    var gaps=(r.areas||[]).map(function(x){ return Math.round((x.t-x.v)*100); });
    var peor=gaps.indexOf(Math.max.apply(null,gaps));

    var cnt={live:0,mid:0,brk:0};
    (r.areas||[]).forEach(function(x){ cnt[x.e]=(cnt[x.e]||0)+1; });
    var tot=gaps.reduce(function(a,b){return a+b},0);
    ar+='<div class="arh">'
      +'<div class="g"><b>'+cnt.live+'<span style="font-size:var(--t-s);color:var(--low)"> / 8</span></b>'
      +'<span>En objetivo</span></div>'
      +'<div class="m"><b>'+cnt.mid+'<span style="font-size:var(--t-s);color:var(--low)"> / 8</span></b>'
      +'<span>Flojos</span></div>'
      +'<div class="b"><b>'+cnt.brk+'<span style="font-size:var(--t-s);color:var(--low)"> / 8</span></b>'
      +'<span>Rotos</span></div>'
      +'<div class="b"><b>'+tot+'<span style="font-size:var(--t-s);color:var(--low)"> pts</span></b>'
      +'<span>Brecha total</span></div></div>';

    (r.areas||[]).forEach(function(x,i){
      var b=BK[x.n]||{}, hoy=Math.round(x.v*100), obj=Math.round(x.t*100), g=gaps[i];
      var fh='';
      (x.falta||[]).forEach(function(f){
        fh+='<div class="fl '+esc(f.e)+'"><span class="fl-i"></span>'
          +'<div class="fl-q">'+esc(f.q)+'</div>'
          +'<div class="fl-d">'+esc(f.d)+'</div></div>';
      });
      ar+='<details class="arx '+esc(x.e)+'"><summary>'
        +'<div class="arx-i">'+esc(x.i)+'</div>'
        +'<div><div class="arx-n">'+esc(x.n)
          +(i===peor?'<span class="arx-fl">cuello</span>':'')+'</div>'
        +'<div class="arx-s">'+esc(b.sis||'—')+' · <i>'+esc(b.agente||'—')+'</i></div></div>'
        +'<div class="arx-mid"><div class="arx-et">'+esc(x.et)+'</div>'
        +'<div class="gap"><i style="width:'+hoy+'%"></i>'
          +'<u style="left:'+hoy+'%;width:'+Math.max(obj-hoy,0)+'%"></u>'
          +'<s style="left:calc('+obj+'% - 1px)"></s></div>'
        +'<div class="arx-nota">'+esc(x.nota)+'</div></div>'
        +'<div class="arx-sc"><b>'+hoy+'<span> / '+obj+'</span></b>'
        +'<span class="arx-gp">'+(g>0?'faltan '+g:'en objetivo')+'</span></div>'
        +'<div class="arx-cv">›</div></summary>'
        +'<div class="arx-body"><div class="arx-r">'+esc(x.r)
        +(x.ver?' <button class="ar-go" data-go="'+esc(x.ver)+'">ver en '+esc(x.ver)+'</button>':'')
        +'</div>'+fh+'</div></details>';
    });
    var nx=D.next, nh='';
    (nx.items||[]).forEach(function(x,i){
      nh+='<div class="ns"><div class="ns-n">'+(i+1)+'</div>'
        +'<div class="ns-t">'+esc(x.n)+'</div>'
        +'<div class="ns-a">'+esc(x.a)+'</div>'
        +'<div class="k2">'+esc(x.por)+'</div>'
        +'<div class="ns-q">'+esc(x.q)+'</div></div>';
    });
    nh+='<div class="concl"><b>Conclusión</b>'+esc(nx.concl)+'</div>';
    return vhead('Radar','desde dónde parto',r.lectura)
      + '<div class="stack">'
      + card('Fuerza por sistema — hoy contra objetivo',
             '<div class="radar-solo">'+s+'</div>'
             +'<div class="legend ctr"><span><i></i>Hoy</span><span><i class="t"></i>Objetivo</span></div>')
      + card('Los 8 sistemas — abre cada uno para ver qué falta',
             ar + '<div class="concl"><b>Conclusión</b>'+esc(r.areas_lectura||'')+'</div>')
      + card(esc(nx.t), nh)
      + '</div>' + skArea('radar');
  }


  /* ── TENDENCIA ── */
  function vTendencia(){
    var t=D.tendencia;
    /* conteos y dinero van en gráficos distintos: son unidades distintas */
    var gr = barrasV(t.barras, [
      {k:'leads',  n:'Leads',   c:'gold'},
      {k:'calls',  n:'Calls',   c:'blue'},
      {k:'cierres',n:'Cierres', c:'teal'}
    ], {alt:'Leads, calls y cierres por mes'});


    /* qué costó en tiempo */
    var tm=t.tiempo, tr='<div class="tm-h"><span>Proceso</span><span>Minutos</span>'
      +'<span>USD</span><span>USD/hora</span><span>Detalle</span></div>';
    tm.filas.forEach(function(f){
      tr+='<div class="tm"><div class="k1">'+esc(f.n)+'</div>'
        +'<div class="tm-v">'+(f.min?f.min:'—')+'</div>'
        +'<div class="tm-v">'+(f.usd?'$'+money(f.usd):'$0')+'</div>'
        +'<div class="tm-v '+esc(f.w)+'">'+(f.hr?'$'+money(f.hr):'—')+'</div>'
        +'<div class="k2">'+esc(f.d)+'</div></div>';
    });
    tr+='<div class="concl"><b>Conclusión</b>'+esc(tm.concl)+'</div>';

    /* diagnóstico por tramo */
    var dg=t.diag, dh='';
    dg.filas.forEach(function(f){
      var sv='<div class="sev">';
      for(var q=0;q<5;q++) sv+='<i class="'+(q<(f.sev||0)?'on':'')+'"></i>';
      sv+='</div>';
      dh+='<div class="dg '+(f.est==='live'?'live':'')+'">'
        +'<div class="dg-top"><div class="dg-tr">'+esc(f.tr)+'</div>'
        +'<div class="dg-cul">'+esc(f.cul)+'</div>'+sv+'</div>'
        +'<div class="dg-b"><div><b>La evidencia</b><p>'+esc(f.ev)+'</p></div>'
        +'<div><b>Qué significa</b><p>'+esc(f.acc)+'</p></div></div></div>';
    });
    dh+='<div class="concl"><b>Conclusión</b>'+esc(dg.concl)+'</div>';

    return vhead('Tendencia','qué produjo cada mes',t.lectura)
      + '<div class="tiles eight">'+t.kpis.map(tile).join('')+'</div>'
      + (t.kpis_nota?'<div class="note" style="margin:calc(var(--s3) * -1) 0 var(--s4)">'
          +esc(t.kpis_nota)+'</div>':'')
      + '<div class="stack" style="margin-top:var(--s3)">'
      + card('El embudo, mes a mes', gr
          + '<div class="note">Eje compartido: las tres series se miden con la misma vara, '
          + 'así la caída de leads a calls a cierres se ve dentro de cada mes. '
          + 'Agosto va translúcido porque está en curso.</div>')
      + card(esc(tm.t), tr)
      + card(esc(dg.t), dh)
      + (function(){
          var b=t.bandeja; if(!b) return '';
          var mx=Math.max.apply(null,b.filas.map(function(f){return f.v}))||1, bh='';
          b.filas.forEach(function(f){
            bh+='<div class="bnd"><div class="k1">'+esc(f.n)+'</div>'
              +'<div class="bnd-v">'+money(f.v)+'</div>'
              +'<div class="bnd-t'+(f.e==='blind'?' blind':'')+'"><i style="width:'
              +Math.max(Math.round(f.v/mx*100),3)+'%"></i></div>'
              +'<div class="bnd-h">'+esc(f.h)+'<span>'+f.conv+'% cierra</span></div>'
              +'<div class="k2">'+esc(f.d)+'</div></div>';
          });
          bh+='<div class="concl"><b>Conclusión</b>'+esc(b.concl)+'</div>';
          var sb='<div class="sb">'+b.siembra.filas.map(function(x){
            return '<div class="sb-c"><div class="sb-n">'+esc(x.n)+'</div>'
              +'<div class="sb-q">'+esc(x.q)+'</div>'
              +'<div class="sb-d">'+esc(x.d)+'</div></div>'; }).join('')+'</div>'
            +'<div class="concl"><b>Conclusión</b>'+esc(b.siembra.concl)+'</div>';
          return card(esc(b.t), bh) + card(esc(b.siembra.t), sb);
        })()
      + '</div>' + skArea('tendencia');
  }


  /* resumen de cada pestaña, para leer el negocio sin entrar a ninguna */
  function resumenGlobal(){
    /* una fila por pestaña del embudo, con sus tres números que deciden */
    var R=[
     {v:'crm',n:'CRM',k:[
       {l:'Fichas en el CRM',v:'43',e:'mid'},{l:'Calificadas',v:'31 / 43',e:'mid'},
       {l:'Clientes activos',v:'5',e:'live'}]},
     {v:'marketing',n:'Marketing',k:[
       {l:'Alcance del año',v:'721k',e:'live'},{l:'Guardados',v:'8.858',e:'live'},
       {l:'Mensajes atribuidos',v:'0',e:'brk'}]},
     {v:'ventas',n:'Ventas',k:[
       {l:'Cobrado histórico',v:'$14.560',e:'live'},{l:'Meta de septiembre',v:'2 cierres',e:'brk'},
       {l:'Cierre en propuesta',v:'100%',e:'live'}]},
     {v:'delivery',n:'Delivery',k:[
       {l:'Sesiones registradas',v:'26',e:'live'},{l:'Bloqueo que más pesa',v:'Closing',e:'brk'},
       {l:'Bloqueos resueltos',v:'0 / 26',e:'brk'}]},
     {v:'success',n:'Success',k:[
       {l:'Señal de renovación',v:'3 / 5',e:'live'},{l:'Casos con número',v:'6',e:'live'},
       {l:'Casos publicados',v:'0 / 6',e:'brk'}]},
    ];
    return '<div class="res">'+R.map(function(r){
      return '<div class="res-c" data-go="'+r.v+'">'
        +'<div class="res-t"><b>'+esc(r.n)+'</b><span class="go">ver ›</span></div>'
        + r.k.map(function(x){
            return '<div class="res-k"><span>'+esc(x.l)+'</span>'
              +'<b class="'+x.e+'">'+esc(x.v)+'</b></div>'; }).join('')
        +'</div>'; }).join('')+'</div>';
  }


/* ── piezas (base64) ──

{"mp-quiensoy": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAASABIAAD/4QBMRXhpZgAATU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAA8KADAAQAAAABAAABLAAAAAD/7QA4UGhvdG9zaG9wIDMuMAA4Qkl…
*/

  function barrasV(meses, series, opt){
    opt=opt||{};
    var W=760, H=opt.h||260, L=44, R=16, T=22, B=42;
    var iw=W-L-R, ih=H-T-B, N=meses.length, S=series.length;
    var max=0;
    meses.forEach(function(m){ series.forEach(function(se){
      max=Math.max(max, m[se.k]||0); }); });
    max=max||1;
    var esc_=Math.pow(10,Math.floor(Math.log10(max)));
    var tope=Math.ceil(max/esc_)*esc_;
    var gw=iw/N, bw=Math.min((gw-18)/S, 44);
    var y=function(v){ return T+ih-(v/tope)*ih; };
    var out='<svg viewBox="0 0 '+W+' '+H+'" class="bv" role="img" aria-label="'
      +esc(opt.alt||'Series por mes')+'">';
    [0,.5,1].forEach(function(f){
      var yy=(T+ih-f*ih).toFixed(1);
      out+='<line class="tg-grid" x1="'+L+'" y1="'+yy+'" x2="'+(W-R)+'" y2="'+yy+'"/>'
        +'<text class="tg-axis" x="'+(L-9)+'" y="'+(+yy+4)+'" text-anchor="end">'
        +(opt.money?'$'+money(Math.round(tope*f)):Math.round(tope*f))+'</text>';
    });
    meses.forEach(function(m,mi){
      var gx=L+mi*gw, cx=gx+gw/2, tot=S*bw+(S-1)*4, x0=cx-tot/2;
      series.forEach(function(se,si){
        var v=m[se.k]||0, bx=x0+si*(bw+4), by=y(v), bh=T+ih-by;
        if(v>0){
          out+='<rect class="bv-b'+(m.parcial?' parcial':'')+'" x="'+bx.toFixed(1)+'" y="'
            +by.toFixed(1)+'" width="'+bw.toFixed(1)+'" height="'+Math.max(bh,2).toFixed(1)
            +'" rx="3" fill="var(--'+se.c+')"/>';
          out+='<text class="bv-v" x="'+(bx+bw/2).toFixed(1)+'" y="'+(by-7).toFixed(1)
            +'" text-anchor="middle" fill="var(--'+se.c+')">'
            +(opt.money?'$'+money(v):v)+'</text>';
        } else {
          out+='<line class="bv-z" x1="'+bx.toFixed(1)+'" y1="'+(T+ih)+'" x2="'
            +(bx+bw).toFixed(1)+'" y2="'+(T+ih)+'"/>';
          out+='<text class="bv-v zero" x="'+(bx+bw/2).toFixed(1)+'" y="'+(T+ih-7)
            +'" text-anchor="middle">0</text>';
        }
      });
      out+='<text class="bv-m" x="'+cx.toFixed(1)+'" y="'+(H-16)+'" text-anchor="middle">'
        +esc(m.m)+'</text>';
      if(m.parcial)
        out+='<text class="bv-sub" x="'+cx.toFixed(1)+'" y="'+(H-4)+'" text-anchor="middle">en curso</text>';
    });
    var key='<div class="bg-key">'+series.map(function(se){
      return '<span><i style="background:var(--'+se.c+')"></i>'+esc(se.n)+'</span>'; }).join('')+'</div>';
    return key+out+'</svg>';
  }


  /* radar chico para cada cliente, mismos ejes para todos */
  function radarMini(vals, labels){
    var ejes=vals.map(function(v,i){return {l:labels[i], v:v};});
    var C=85,R=44,N=ejes.length;
    var pt=function(i,v){var a=-Math.PI/2+i*2*Math.PI/N;
      return [C+Math.cos(a)*R*v,C+Math.sin(a)*R*v];};
    var poly=function(f){return ejes.map(function(e,i){
      var p=pt(i,typeof f==='number'?f:e.v); return p[0].toFixed(1)+','+p[1].toFixed(1);}).join(' ');};
    var s='<svg class="mini" viewBox="-32 -4 234 178">';
    [0.5,1].forEach(function(g){ s+='<polygon class="g" points="'+poly(g)+'"/>'; });
    s+='<polygon class="v" points="'+poly()+'"/>';
    ejes.forEach(function(e,i){
      var lp=pt(i,1.34), a=-Math.PI/2+i*2*Math.PI/N, cx=Math.cos(a);
      var an=Math.abs(cx)<.3?'middle':(cx>0?'start':'end');
      s+='<text x="'+lp[0].toFixed(1)+'" y="'+(lp[1]+2.5).toFixed(1)+'" text-anchor="'+an+'">'
        +esc(e.l.toUpperCase())+'</text>';
    });
    return s+'</svg>';
  }
