//Iniciar el video en vivo
//Inicializar el modelo
//Hacer que el modelo inicie a detectar objetos
//Hacer que se muestren los objetos detectados en la página.


//1.

let video = document.getElementById('webcam')
let containerWebcam = document.getElementById('containerVideo')
let buttonWebcam

if (navigator.mediaDevices) {
    buttonWebcam = document.getElementById('webcamButton')
    buttonWebcam.addEventListener('click', habilitarWebcam)
} else {
    alert('Your computer doesnt support webcam')
}

function habilitarWebcam() {

    buttonWebcam.classList.add('ocultar')

    navigator.mediaDevices.getUserMedia({ video: true })
        .then(linkVideo => {
            video.srcObject = linkVideo
            video.addEventListener('loadeddata', iniciarDetecciones)
        })

}

//2 

import { ObjectDetector, FilesetResolver } from 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2'

let object_detector


const iniciarModelo = async () => {
    const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.2/wasm"
    )

    object_detector = await ObjectDetector.createFromOptions(vision, {
        baseOptions: {
            modelAssetPath: "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite0/float16/1/efficientdet_lite0.tflite",
            delegate: "GPU"
        },
        scoreThreshold: 0.5,
        runningMode: "VIDEO" //We can use "IMAGE" too
    })

}

iniciarModelo()


//3

async function iniciarDetecciones() {

    let hoyEnMs = Date.now()
    const detecciones = await object_detector.detectForVideo(video, hoyEnMs)
    mostrarDeteccionesEnLaPagina(detecciones)
    window.requestAnimationFrame(iniciarDetecciones)
}

let children = []

function mostrarDeteccionesEnLaPagina(results) {

    children.forEach(child => {
        containerWebcam.removeChild(child)
    })

    children.splice(0)

    results.detections.forEach(detection => {
        const p = document.createElement('p')
        console.log(detection);
        p.innerText =
            detection.categories[0].categoryName +
            " - con " +
            Math.round((detection.categories[0].score) * 100) +
            "% de credibilidad"

        p.style =
            "top: " +
            detection.boundingBox.originY +
            "px;" +
            "left: " +
            (video.offsetWidth - detection.boundingBox.width - detection.boundingBox.originX) +
            "px;" +
            "width: " +
            detection.boundingBox.width +
            "px;"


        const resaltador = document.createElement('div')
        resaltador.setAttribute('class', 'resaltador')
        resaltador.style =
            "top: " +
            detection.boundingBox.originY +
            "px;" +
            "left: " +
            (video.offsetWidth - detection.boundingBox.width - detection.boundingBox.originX) +
            "px;" +
            "width: " +
            detection.boundingBox.width +
            "px;" +
            "height: " +
            detection.boundingBox.height +
            "px;"

        containerWebcam.appendChild(p)
        containerWebcam.appendChild(resaltador)

        children.push(p)
        children.push(resaltador)

    })

}