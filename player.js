const MODE = {
    "NO":0,
    "ONE":1,
    "LIST":2
};

class Player {
    constructor(el,app){
        this.app = app;
        this.playerDom = document.querySelector(el);
        this.audio = this.playerDom.querySelector("audio");
        this.playBtn = this.playerDom.querySelector(".play");
        this.pauseBtn = this.playerDom.querySelector(".pause");
        this.stopBtn = this.playerDom.querySelector(".stop");

        this.progressBar = this.playerDom.querySelector(".bar");

        this.currentSpan = this.playerDom.querySelector(".current-time");
        this.totalSpan = this.playerDom.querySelector(".total-time");

        this.progress = this.playerDom.querySelector(".progress");
        this.fileName = this.playerDom.querySelector(".name");

        this.playable = false; // 현재 플레이가 가능한가?

        this.repeatMode = MODE.NO; //최초에는 반복 없음으로
        
        this.modeBtnList = document.querySelectorAll(".repeat-btn");

        this.canvas = this.playerDom.querySelector(".visualizer > canvas");
        this.ctx = this.canvas.getContext("2d");
        const visual = this.playerDom.querySelector(".visualizer");
        this.canvas.width = visual.clientWidth;
        this.canvas.height = visual.clientHeight;


        this.aCtx = null;
        this.analyser = null;
        this.dataArray = null;
        this.barHeight = 0;
        this.x = 0;
        this.barWidth = null; //캔버스에 그려줄 바의 너비

        this.addListener();
        requestAnimationFrame(this.frame.bind(this));
    }

    initVisual() {
        this.aCtx = new AudioContext();
        //현재 오디오 태그로부터 미디어 소스를 가져온다.
        let audioSrc = this.aCtx.createMediaElementSource(this.audio);
        //분석기를 생성한다.
        this.analyser = this.aCtx.createAnalyser();
        //뽑아온 미디어 소스를 오디오 컨텍스트와 분석기에 연결한다.
        audioSrc.connect(this.aCtx.destination);
        audioSrc.connect(this.analyser);

        this.analyser.fftSize = 1024; //512개의 레벨로 사운드 바가 만들어짐.

        const W = this.canvas.width;
        const bufferLength = this.analyser.frequencyBinCount;

        this.barWidth = ( W / (bufferLength + 1));
        this.dataArray = new Uint8Array(bufferLength);
        
    }

    addListener(){
        this.playBtn.addEventListener("click",  this.play.bind(this));
        this.pauseBtn.addEventListener("click",  this.pause.bind(this));
        this.stopBtn.addEventListener("click",  this.stop.bind(this));
        this.progress.addEventListener("click", this.changeSeeking.bind(this));
        this.audio.addEventListener("ended",this.musicEnd.bind(this));

        this.modeBtnList.forEach(btn => {
            btn.addEventListener("click", (e)=>{
                this.repeatMode = e.target.value * 1;
            });
        });
    }

    

    musicEnd() {
        //음악이 끝났을 때 해야할 일
        if(this.repeatMode == MODE.ONE){//한곡반복
            // this.audio.currentTime = 0;
            this.audio.play();
        }else if(this.repeatMode == MODE.LIST){
            this.app.playList.getNextMusic(true);
        }else if(this.repeatMode == MODE.NO) {
            this.app.playList.getNextMusic(false);
        }
    }

    changeSeeking(e){
        if(!this.playable) return;
        let target = e.offsetX / this.progress.clientWidth * this.audio.duration;
        this.audio.currentTime = target;
    }

    play(){
        if(!this.playable) return;
        this.audio.play();
        this.pauseBtn.classList.remove("hidden");
        this.playBtn.classList.add("hidden");
    }

    pause(){
        if(!this.playable) return;
        this.audio.pause();
        this.playBtn.classList.remove("hidden");
        this.pauseBtn.classList.add("hidden");
    }

    stop(){
        if(!this.playable) return;
        this.audio.pause();
        this.audio.currentTime = 0;
    }

    frame(timestamp){
        requestAnimationFrame(this.frame.bind(this));
        if(!this.playable) {
            return;
        }
        this.analyser.getByteFrequencyData(this.dataArray);
        console.log(this.dataArray);
        this.render();
    }

    render(){
        if(!this.playable) return;
        let current = this.audio.currentTime;
        let duration = this.audio.duration;
        this.progressBar.style.width = `${current / duration * 100}%`;

        this.currentSpan.innerHTML = current.timeFormat();
        this.totalSpan.innerHTML = duration.timeFormat();

        const ctx = this.ctx;
        const W = this.canvas.width;
        const H = this.canvas.height;

        ctx.fillStyle = "rgba(0,0,0,0.2)";
        ctx.fillRect(0, 0, W, H); //매 프레임마다 캔버스를 검게 칠해준다. 

        this.dataArray.forEach( (x, idx) => {
            ctx.fillStyle = this.getColor(x);
            ctx.fillRect(idx * (this.barWidth + 1), (H - x)/2, this.barWidth, x);
        });
    }

    getColor(value){
        let p = value / 255;  // 0 ~ 1
        if(p > 0.8){
            return "#e3f2fd";
        } else if ( p > 0.6 ){
            return "#90caf9";
        } else if ( p > 0.4) {
            return "#29b6f6";
        } else if (p > 0.2){
            return "#0288d1";
        }else {
            return "#01579b";
        }
    }
    loadMusic(musicFile) {
        if(this.aCtx == null) {
            this.initVisual();
        }

        let fileURL = URL.createObjectURL(musicFile);
        this.audio.pause();
        this.audio.src = fileURL;

        this.audio.addEventListener("loadeddata", ()=>{
            this.fileName.innerHTML = musicFile.name;
            this.playable=true;
            this.audio.play();
        });
        
    }

}

window.addEventListener("load", ()=>{
    let player = new Player("#player");
});