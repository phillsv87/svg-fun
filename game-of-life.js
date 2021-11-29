// A mid day IIFE
(()=>{

    const body=document.body;
    const pathElem=document.getElementById('game-path');
    const svgElem=document.getElementById('game-svg');
    const inputOverlay=document.getElementById('input-overlay');
    const btnPP=document.getElementById('btn-pp');
    const btnZoom=document.getElementById('btn-zoom');
    const btnMove=document.getElementById('btn-move');
    const btnDraw=document.getElementById('btn-draw');
    const btnClear=document.getElementById('btn-clear');
    const btnZoomIn=document.getElementById('btn-zoom-in');
    const btnZoomOut=document.getElementById('btn-zoom-out');
    const btnMoveLeft=document.getElementById('btn-move-left');
    const btnMoveRight=document.getElementById('btn-move-right');
    const btnMoveUp=document.getElementById('btn-move-up');
    const btnMoveDown=document.getElementById('btn-move-down');
    const popupBgs=document.getElementsByClassName('popup-bg');

    let lastTime=0;
    let delta=0;

    let speed=500;
    let blockSize=50;
    let scale=0.1;
    let offsetX=0;
    let offsetY=0;
    let isPlaying=false;
    let isMouseDown=false;
    let mouseUpTime=0;
    const dragPause=800;

    const iyio=[
        {"x":1,"y":1},{"x":2,"y":1},{"x":3,"y":1},{"x":6,"y":1},{"x":8,"y":1},{"x":11,"y":1},
        {"x":12,"y":1},{"x":13,"y":1},{"x":16,"y":1},{"x":17,"y":1},{"x":18,"y":1},{"x":2,"y":2},
        {"x":6,"y":2},{"x":8,"y":2},{"x":12,"y":2},{"x":16,"y":2},{"x":18,"y":2},{"x":2,"y":3},
        {"x":7,"y":3},{"x":12,"y":3},{"x":16,"y":3},{"x":18,"y":3},{"x":1,"y":4},{"x":2,"y":4},
        {"x":3,"y":4},{"x":7,"y":4},{"x":11,"y":4},{"x":12,"y":4},{"x":13,"y":4},{"x":16,"y":4},
        {"x":17,"y":4},{"x":18,"y":4}
    ];

    const map/*:{[y:string]:{[x:string]:{x:number,y:number,n:0}}}*/={}

    let windowSize={w:window.innerWidth,h:window.innerHeight}




    const init=()=>{
        updateWindowSize();
        loadIYIO();
        setTimeout(start,3000);
    }

    const frame=()=>{
        const now=new Date().getTime();
        if(isMouseDown || (now-mouseUpTime)<dragPause){
            return;
        }
        updatePopulation();
        draw();
    }

    const updatePopulation=()=>{
        const newBlocks={}
        for(const sy in map){
            const row=map[sy];
            for(const sx in row){

                const cell=row[sx];
                cell.n=getNCount(cell.x,cell.y);

                checkForNew(cell.x-1,cell.y-1,newBlocks);
                checkForNew(cell.x,cell.y-1,newBlocks);
                checkForNew(cell.x+1,cell.y-1,newBlocks);
                checkForNew(cell.x+1,cell.y,newBlocks);
                checkForNew(cell.x+1,cell.y+1,newBlocks);
                checkForNew(cell.x,cell.y+1,newBlocks);
                checkForNew(cell.x-1,cell.y+1,newBlocks);
                checkForNew(cell.x-1,cell.y,newBlocks);
            }

        }

        for(const sy in map){
            const row=map[sy];
            for(const sx in row){
                const cell=row[sx];
                if(cell.n<=1 || cell.n>=4){
                    deleteBlock(sx,sy);
                }
            }

        }

        for(const sy in newBlocks){
            const row=newBlocks[sy];
            for(const sx in row){
                const cell=row[sx];
                if(!map[sy]){
                    map[sy]={}
                }
                map[sy][sx]=cell;
            }
        }
    }

    const getNCount=(x,y)=>{
        return (
            (map[y-1]?.[x-1]?1:0)+
            (map[y-1]?.[x]?1:0)+
            (map[y-1]?.[x+1]?1:0)+
            (map[y]?.[x+1]?1:0)+
            (map[y+1]?.[x+1]?1:0)+
            (map[y+1]?.[x]?1:0)+
            (map[y+1]?.[x-1]?1:0)+
            (map[y]?.[x-1]?1:0)
        )
    }

    const checkForNew=(x,y,newBlocks)=>{
        if(map[y]?.[x] || newBlocks[y]?.[x]){
            return;
        }
        
        const count=getNCount(x,y);
        if(count===3){
            if(!newBlocks[y]){
                newBlocks[y]={}
            }
            newBlocks[y][x]={n:count,x,y}
        }
    }

    const addBlock=(x,y)=>{
        if(!map[y]){
            map[y]={}
        }
        map[y][x]={n:0,x,y}
    }

    const deleteBlock=(x,y)=>{
        if(!map[y]){
            return;
        }
        delete map[y][x];
        for(const e in map[y]){
            return;
        }
        delete map[y];
    }



    const draw=()=>{

        let path='';

        for(const sy in map){
            const row=map[sy];
            for(const sx in row){
                const cell=row[sx];
                path+=(
                    `M ${(cell.x-offsetX)*blockSize*scale},${(cell.y-offsetY)*blockSize*scale} `+
                    `h ${blockSize*scale} `+
                    `v ${blockSize*scale} `+
                    `h ${-blockSize*scale} `+
                    `Z`
                );
            }
        }

        pathElem.setAttribute('d',path);
    }

    const updateWindowSize=()=>{
        windowSize={w:window.innerWidth,h:window.innerHeight}
        svgElem.viewBox=`0 0 ${windowSize.w} ${windowSize.h}`;
        svgElem.style.width=windowSize.w+'px';
        svgElem.style.height=windowSize.h+'px';
    }

    const pagePosToBlock=(x,y)=>{
        return {
            x:Math.floor(x/(blockSize*scale))+Math.round(offsetX),
            y:Math.floor(y/(blockSize*scale))+Math.round(offsetY),
        }
    }

    let playIv=0;
    const start=()=>{
        if(isPlaying){
            return;
        }
        isPlaying=true;
        clearInterval(playIv);
        playIv=setInterval(()=>{
            delta=speed;
            frame();
        },speed);
        btnPP.innerHTML='Pause';
    }
    const pause=()=>{
        if(!isPlaying){
            return;
        }
        isPlaying=false;
        clearInterval(playIv);
        btnPP.innerHTML='Play';
    }

    const getPoints=()=>{
        const points=[];
        for(const sy in map){
            const row=map[sy];
            for(const sx in row){
                const cell=map[sy][sx];
                points.push({x:cell.x,y:cell.y});
            }

        }
        return points;
    }

    const clearMap=()=>{
        for(const sy in map){
            delete map[sy];
        }
    }

    const zoomIn=()=>{
        scale*=1.1;
        draw();
    }

    const zoomOut=()=>{
        scale*=0.9;
        draw();
    }

    const togglePlayPause=()=>{
        if(isPlaying){
            pause();
        }else{
            start();
        }
    }

    const moveUp=()=>{
        offsetY-=Math.round(1/scale);
        draw();
    }

    const moveDown=()=>{
        offsetY+=Math.round(1/scale);
        draw();
    }

    const moveLeft=()=>{
        offsetX-=Math.round(1/scale);
        draw();
    }

    const moveRight=()=>{
        offsetX+=Math.round(1/scale);
        draw();
    }

    const getPointsSize=(points)=>{
        if(!points?.length){
            return {w:0,h:0}
        }
        let f=points[0];
        let l=f.x,r=f.x,t=f.y,b=f.y;
        for(let i=1;i<points.length;i++){
            const p=points[i];
            if(p.x<l){
                l=p.x;
            }else if(p.x>r){
                r=p.x;
            }
            if(p.y<t){
                t=p.y;
            }else if(p.y>b){
                b=p.y;
            }
        }
        return {w:r-l,h:b-t}
    }

    const loadPointsCentered=(points,clear=true)=>{
        const size=getPointsSize(points);
        const winBr=pagePosToBlock(window.innerWidth,window.innerHeight);
        loadPoints(points,clear,
            Math.round((winBr.x-offsetX-size.w)/2)+offsetX,
            Math.round((winBr.y-offsetY-size.h)/2)+offsetY)
    }

    const loadPoints=(points,clear=true,x=0,y=0)=>{
        if(clear){
            clearMap();
        }
        for(const p of points){
            addBlock(p.x+x,p.y+y)
        }
        draw();
    }

    const loadIYIO=()=>{
        loadPointsCentered(iyio,false,offsetX,offsetY);
    }

    let dragAdd=false;
    const dragPoint=(x,y,start=false)=>{
        const pos=pagePosToBlock(x,y);
        
        if(start){
            dragAdd=map[pos.y]?.[pos.x]?false:true;
        }

        if(dragAdd){
            addBlock(pos.x,pos.y);
        }else{
            deleteBlock(pos.x,pos.y);
        }
        draw();
    }

    const openPopup=(id)=>{
        const popup=document.getElementById(id);
        if(!popup){
            throw new Error('openPopup - No popup found by id:'+id);
        }
        popup.classList.add('open');
    }

    const closePopup=(id)=>{
        const popup=document.getElementById(id);
        if(!popup){
            throw new Error('closePopup - No popup found by id:'+id);
        }
        popup.classList.remove('open');
    }
    
    inputOverlay.addEventListener('mousedown',(e)=>{
        isMouseDown=true;
        dragPoint(e.clientX,e.clientY,true)
    })
    inputOverlay.addEventListener('mousemove',(e)=>{
        if(isMouseDown){
            dragPoint(e.clientX,e.clientY);
        }
    })
    inputOverlay.addEventListener('mouseup',(e)=>{
        mouseUpTime=new Date().getTime();
        isMouseDown=false;
    })
    inputOverlay.addEventListener('mouseleave',(e)=>{
        mouseUpTime=new Date().getTime();
        isMouseDown=false;
    })


    let gestStart=null;//{a:{id:number,x:number,y:number},b:...}
    let gest=null;
    let gestCenterXR=0;
    let gestCenterYR=0;
    let gestStartOffsetX=offsetX;
    let gestStartOffsetY=offsetY;
    let gestStartScale=scale;
    const getPtDist=(a,b)=>{
        const sizeA=Math.abs(a.x-b.x);
        const sizeB=Math.abs(a.y-b.y);
        return Math.sqrt(sizeA*sizeA+sizeB*sizeB);
    }
    const getPtCenter=(a,b)=>{
        return {
            x:a.x<b.x?a.x+(b.x-a.x)/2:b.x+(a.x-b.x)/2,
            y:a.y<b.y?a.y+(b.y-a.y)/2:b.y+(a.y-b.y)/2}
    }
    const findTouchPoint=(touches,id)=>{
        for(let i=0;i<touches.length;i++){
            if(touches[i].identifier===id){
                return touches[i];
            }
        }
        return null;
    }
    inputOverlay.addEventListener('touchstart',(e)=>{
        if(e.touches.length>1){
            const now=new Date().getTime();
            if(isMouseDown){
                mouseUpTime=now;
                isMouseDown=false;
            }
            if(!gest){
                gest={
                    a:{
                        id:e.touches[0].identifier,
                        x:e.touches[0].pageX,
                        y:e.touches[0].pageY,
                    },
                    b:{
                        id:e.touches[1].identifier,
                        x:e.touches[1].pageX,
                        y:e.touches[1].pageY,
                    }
                }
                gestStart={a:{...gest.a},b:{...gest.b}}
                gestStartOffsetX=offsetX;
                gestStartOffsetY=offsetY;
                gestStartScale=scale;

                const center=getPtCenter(gest.a,gest.b);
                gestCenterXR=center.x/window.innerWidth;
                gestCenterYR=center.y/window.innerHeight;
            }
        }else if(!isMouseDown){
            gest=null;
            gestStart=null;
            isMouseDown=true;
        }
    },false)
    inputOverlay.addEventListener('touchmove',(e)=>{
        if(gestStart && gest){
                try{
                const ptA=findTouchPoint(e.touches,gestStart.a.id);
                const ptB=findTouchPoint(e.touches,gestStart.b.id);
                if(ptA && ptB){
                    gest.a.x=ptA.pageX;
                    gest.a.y=ptA.pageY;
                    gest.b.x=ptB.pageX;
                    gest.b.y=ptB.pageY;
                    const startDist=getPtDist(gestStart.a,gestStart.b);
                    const dist=getPtDist(gest.a,gest.b);

                    const startCenter=getPtCenter(gestStart.a,gestStart.b);
                    const center=getPtCenter(gest.a,gest.b);

                    const diffScale=dist/startDist;
                    scale=gestStartScale*diffScale;

                    const ww=window.innerWidth;
                    const wh=window.innerHeight;

                    const zoomXOffset=Math.round((ww/scale-ww/gestStartScale)*gestCenterXR/blockSize);
                    const zoomYOffset=Math.round((wh/scale-wh/gestStartScale)*gestCenterYR/blockSize);


                    offsetX=gestStartOffsetX-Math.round((center.x-startCenter.x)/blockSize/scale)-zoomXOffset;
                    offsetY=gestStartOffsetY-Math.round((center.y-startCenter.y)/blockSize/scale)-zoomYOffset;

                    draw();
                }
                }catch(ex){
                    inputOverlay.innerText=JSON.stringify({error:true,ex:ex.message},null,4)
                }

        }else if(isMouseDown){
            dragAdd=true;
            dragPoint(e.touches[0].pageX,e.touches[0].pageY);
        }
    },false)
    inputOverlay.addEventListener('touchend',(e)=>{
        if(isMouseDown){
            mouseUpTime=new Date().getTime();
            isMouseDown=false;

            dragAdd=true;
            dragPoint(e.touches[0].pageX,e.touches[0].pageY);
        }else if(gestStart){
            const ptA=findTouchPoint(e.touches,gestStart.a.id);
            const ptB=findTouchPoint(e.touches,gestStart.b.id);
            if(ptA || ptB){
                gest=null;
                gestStart=null;
            }
        }
    },false)

    btnPP.addEventListener('click',togglePlayPause);
    btnDraw.addEventListener('click',loadIYIO);
    btnClear.addEventListener('click',()=>{clearMap();draw()});
    btnZoom.addEventListener('click',()=>openPopup('popupPanZoom'));
    btnMove.addEventListener('click',()=>openPopup('popupPanZoom'));
    btnZoomIn.addEventListener('click',zoomIn);
    btnZoomOut.addEventListener('click',zoomOut);
    btnMoveLeft.addEventListener('click',moveLeft);
    btnMoveRight.addEventListener('click',moveRight);
    btnMoveUp.addEventListener('click',moveUp);
    btnMoveDown.addEventListener('click',moveDown);

    for(const b of popupBgs)
    {
        b.addEventListener('click',e=>{
            e.preventDefault();
            closePopup(e.target.parentElement.id?.replace('#',''));
        })
    }

    window.addEventListener('keydown',e=>{
        //console.log(e.code)
        switch(e.code){

            case 'Space':
                togglePlayPause();
                break;

            case 'Minus':
                zoomOut();
                break;

            case 'Equal':
                zoomIn();
                break;

            case 'KeyE':
                window.open('mailto:scott@iyio.io','_blank')
                break;

            case 'KeyF':
                frame();
                break;

            case 'KeyP':
                const points=getPoints();
                console.info('Points',JSON.stringify(points))
                console.info('Map',JSON.stringify(map,null,4))
                break;

            case 'KeyI':
                loadIYIO();
                break;

            case 'KeyC':
                clearMap();
                draw();
                break;

            case 'ArrowDown':
                moveDown();
                break;

            case 'ArrowUp':
                moveUp();
                break;

            case 'ArrowRight':
                moveRight();
                break;

            case 'ArrowLeft':
                moveLeft();
                break;
        }
    });
    
    window.addEventListener('resize',updateWindowSize);


    init();

})();