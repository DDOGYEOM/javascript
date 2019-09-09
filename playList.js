class PlayList {
    constructor(el, app){
        this.app = app;
        this.listDom = document.querySelector(el);
        this.itemList = this.listDom.querySelector(".item-list");
        this.addBtn = this.listDom.querySelector("#openDialog");
        this.fileInput = this.listDom.querySelector("#audioFile");

        this.itemList.innerHTML = "";
        this.fileList = []; //플레이리스트 상에 있는 음악파일들을 저장
        this.playIdx = null; //현재 재생중인 음악의 인덱스를 저장

        this.currentMusic = null;

        this.addListener();
    }

    addListener(){
        this.addBtn.addEventListener("click", e => this.fileInput.click());
        this.fileInput.addEventListener("change", this.addList.bind(this));
    }

    addList(e) {
        Array.from(e.target.files).forEach(file => {
            let obj = {idx: this.fileList.length, file: file, dom: null};
            this.fileList.push(obj);
            let item = document.createElement("li");
            item.classList.add("item");
            obj.dom = item;
            item.addEventListener("dblclick", (e) => {
                let data = this.fileList.find(x => x.idx == obj.idx);
                this.playItem(data);
            });
            item.innerHTML = file.name;
            this.itemList.appendChild(item);
        });
    }

    playItem(data){
        this.fileList.forEach(file => {
            file.dom.classList.remove("active");
        });

        this.currentMusic = data.idx; //현재 재생중인 음악의  idx를 저장

        data.dom.classList.add("active");
        this.app.player.loadMusic(data.file);
    }

    getNextMusic(loop) {
        let now = this.fileList.findIndex(x => x.idx == this.currentMusic);
        if(now < this.fileList.length - 1) {
            this.playItem(this.fileList[now + 1]);
        }else if(loop){
            this.playItem(this.fileList[0]);
        }
    }
}