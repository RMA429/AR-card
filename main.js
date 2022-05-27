import { CSS3DObject } from '/node_modules/three/examples/jsm/renderers/CSS3DRenderer.js';
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

function loadVideo(path){
    return new Promise((resolve, reject) => {
      const video = document.createElement("video");
      //video.addEventListener('loadeddata', () => {
      video.addEventListener('loadedmetadata', () => {
        video.setAttribute('playsinline', '');
        resolve(video);
      });
      video.src = path;
    });
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
        ] = await loadTextures([
        './Assets/Images/I-Logo-Text-BWH.png',
        ]);

        const planeGeometry = new THREE.PlaneGeometry(1, 0.552);
        const cardMaterial = new THREE.MeshBasicMaterial({map: cardTexture});
        const card = new THREE.Mesh(planeGeometry, cardMaterial);

        //create anchor points to images
        const anchor = mindarThree.addAnchor(0); //first image rendered in targets.mind
        anchor.group.add(Blueplane); //THREE.Group
        anchor.onTargetFound = () => {
            console.log("IC logo found");
        }
        anchor.onTargetLost = () => {
            console.log("IC logo lost");
        }

        await mindarThree.start();

        renderer.setAnimationLoop(() => {
            renderer.render(scene, camera);
        });
    }

    start();
});