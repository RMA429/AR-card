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

        const mindarThree = new window.MINDAR.IMAGE.MindARThree({
            container: document.body,
            imageTargetSrc: './Assets/targets.mind',
            maxTrack: 1, //how many images to track at one time on screen. can affect performance noticeably so keep reasonable/necessary
        });

        const {renderer, scene, camera} = mindarThree;


        //creating some basic squares for testing
        const geometry = new THREE.PlaneGeometry(1,1);
        const Bluematerial = new THREE.MeshBasicMaterial({color: 0x0000ff, transparent: true, opacity: 0.5});
        const Blueplane = new THREE.Mesh(geometry, Bluematerial);

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