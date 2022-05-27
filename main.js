import { CSS3DObject } from '/node_modules/three/examples/jsm/renderers/CSS3DRenderer.js';

import {loadGLTF, loadTexture, loadTextures, loadVideo} from '/libs/loaders.js';

const THREE = window.MINDAR.IMAGE.THREE;

function videoLoop(path){
//this block of code is to run a pre recorded video for testing
    navigator.mediaDevices.getUserMedia = () => { 
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            video.setAttribute("src", path);
            video.setAttribute("loop", "")

            video.oncanplay = () => {
                const stream = video.captureStream();
                video.play();
                resolve(stream);
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const start = async() =>{

        //videoLoop("./Assets/Videos/test-ICLogo.mp4")

        //initialize mindAR
        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: document.body,
            imageTargetSrc: './Assets/targets.mind',
            maxTrack: 1, //how many images to track at one time on screen. can affect performance noticeably so keep reasonable/necessary
        });

        const {renderer, cssRenderer, scene, cssScene, camera} = mindarThree;

        const light = new THREE.HemisphereLight( 0xffffff, 0xbbbbff, 1 );
        scene.add(light);

        const [
        cardTexture,
        webTexture,
        ] = await loadTextures([
        './Assets/Images/I-Logo-Text-BWH.png',
        './Assets/Images/Web.png'
        ]);

        const planeGeometry = new THREE.PlaneGeometry(1, 0.552);
        const cardMaterial = new THREE.MeshBasicMaterial({map: cardTexture});
        const card = new THREE.Mesh(planeGeometry, cardMaterial);

        const iconGeometry = new THREE.CircleGeometry(0.075, 32);
        const webMaterial = new THREE.MeshBasicMaterial({map: webTexture});
        const webIcon = new THREE.Mesh(iconGeometry, webMaterial);


        webIcon.position.set(-0.14, -0.5, 0);

        //create anchor points to images
        const anchor = mindarThree.addAnchor(0); //first image rendered in targets.mind
        anchor.group.add(card); //THREE.Group
        anchor.group.add(webIcon);
        anchor.onTargetFound = () => {
            console.log("IC logo found");
        }
        anchor.onTargetLost = () => {
            console.log("IC logo lost");
        }

        const textElement = document.createElement("div");
        const textObj = new CSS3DObject(textElement);
        textObj.position.set(0, -1000, 0);
        textObj.visible = false;
        textElement.style.background = "#FFFFFF";
        textElement.style.padding = "30px";
        textElement.style.fontSize = "60px";
    
        const cssAnchor = mindarThree.addCSSAnchor(0);
        cssAnchor.group.add(textObj);

        //Button handling
        webIcon.userData.clickable = true;

        document.body.addEventListener('click', (e) => {
            const mouseX = (e.clientX / window.innerWidth) * 2 - 1;
            const mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
            const mouse = new THREE.Vector2(mouseX, mouseY);
            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects(scene.children, true);
      
            if (intersects.length > 0) {
                let o = intersects[0].object; 
                while (o.parent && !o.userData.clickable) {
                    o = o.parent;
                }
                if (o.userData.clickable) {
                     if (o === webIcon) {
                        textObj.visible = true;
                        textElement.innerHTML = "https://us.pg.com/";
                    }
                }
            }
        });
      
        
        const clock = new THREE.Clock();

        await mindarThree.start();

        renderer.setAnimationLoop(() => {
            const delta = clock.getDelta();
            const elapsed = clock.getElapsedTime();
            const iconScale = 1 + 0.2 * Math.sin(elapsed*5);
            [webIcon].forEach((icon) => {
	            icon.scale.set(iconScale, iconScale, iconScale);
            });

            renderer.render(scene, camera);
            cssRenderer.render(cssScene, camera);
        });
    }

    start();
});