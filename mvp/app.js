const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let bgImg = null;
let logoImg = null;

/* 画像読込み */
document.getElementById("bgInput").addEventListener("change", (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    bgImg = new Image();
    bgImg.onload = ()=>{
        resizeCanvas(bgImg);
        render();
    };
    bgImg.src = URL.createObjectURL(f);
});

document.getElementById("logoInput").addEventListener("change", (e)=>{
    const f = e.target.files[0];
    if(!f) return;
    logoImg = new Image();
    logoImg.onload = render;
    logoImg.src = URL.createObjectURL(f);
});

/* 元画像サイズに合わせる（最大1080px） */
function resizeCanvas(image){
    let w = image.width;
    let h = image.height;
    const max = 1080;

    if(w > max || h > max){
        const r = w/h;
        if(r > 1){
            w = max;
            h = Math.round(max / r);
        } else {
            h = max;
            w = Math.round(max * r);
        }
    }
    canvas.width = w;
    canvas.height = h;
}

/* UI変化で更新 */
document.querySelectorAll("input, select").forEach(el=>{
    el.addEventListener("input", render);
});

document.getElementById("mode").addEventListener("change", ()=>{
    const m = document.getElementById("mode").value;
    document.getElementById("singleBlock").style.display = (m==="single") ? "block" : "none";
    document.getElementById("repeatBlock").style.display = (m==="repeat") ? "block" : "none";
    render();
});

/* 背景 */
function drawBackground(){
    if(!bgImg){
        ctx.fillStyle = "#ddd";
        ctx.fillRect(0,0,canvas.width,canvas.height);
        return;
    }
    ctx.drawImage(bgImg,0,0,canvas.width,canvas.height);
}

/* ロゴ（左下） */
function drawLogo(){
    if(!logoImg) return;

    const w = Math.round(canvas.width * 0.18);
    const h = w * (logoImg.height/logoImg.width);

    const margin = Math.round(canvas.width * 0.04);
    const x = margin;
    const y = canvas.height - h - margin;

    ctx.globalAlpha = 0.95;
    ctx.drawImage(logoImg, x, y, w, h);
    ctx.globalAlpha = 1;
}

/* 単発デカ文字 */
function drawSingle(){
    const text = textInput.value;
    let size = Number(singleSize.value);
    const opacity = Number(singleOpacity.value);
    const color = document.querySelector('input[name="color"]:checked').value;
    const pos = singlePos.value;

    ctx.globalAlpha = opacity;
    ctx.textAlign = "center";
    ctx.fillStyle = color;

    // Y位置
    let y = canvas.height/2;
    if(pos === "top") y = canvas.height * 0.25;
    if(pos === "bottom") y = canvas.height * 0.75;

    // 自動縮小
    while(true){
        ctx.font = `700 ${size}px 'Inter'`;
        if(ctx.measureText(text).width < canvas.width*0.9) break;
        size--;
        if(size <= 30) break;
    }

    ctx.fillText(text, canvas.width/2, y);
    ctx.globalAlpha = 1;
}

/* 反復テキスト */
function drawRepeat(){
    const text = textInput.value;
    const size = Number(repeatSize.value);
    const opacity = Number(repeatOpacity.value);
    const angle = Number(repeatAngle.value);
    const color = document.querySelector('input[name="color"]:checked').value;

    ctx.save();
    ctx.translate(canvas.width/2, canvas.height/2);
    ctx.rotate(angle * Math.PI/180);
    ctx.font = `${size}px 'Inter'`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;

    // ★密度調整（前より2倍詰める）
    const stepY = size * 3;
    const stepX = size * 6;

    const rangeY = canvas.height * 1.4;
    const rangeX = canvas.width  * 1.4;

    for(let y = -rangeY; y < rangeY; y += stepY){
        for(let x = -rangeX; x < rangeX; x += stepX){
            ctx.fillText(text, x, y);
        }
    }

    ctx.restore();
    ctx.globalAlpha = 1;
}

/* メインレンダー */
function render(){
    if(!canvas.width) return;

    ctx.clearRect(0,0,canvas.width,canvas.height);

    drawBackground();
    drawLogo();

    const m = mode.value;
    if(m==="single") drawSingle();
    else drawRepeat();
}
document.getElementById("btnAddC").addEventListener("click", ()=>{
    textInput.value += "©";
    render();
});

/* 保存 */
savePng.addEventListener("click", ()=>{
    const link = document.createElement("a");
    link.href = canvas.toDataURL("image/png");
    link.download = "ojapp_copyguard.png";
    link.click();
});
