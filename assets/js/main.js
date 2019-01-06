// -------- RECUPERATION DU CONTENU DES SHADERS -------------
function loadText(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url, false);
    xhr.overrideMimeType("text/plain");
    xhr.send(null);
    if (xhr.status === 200)
        return xhr.responseText;
    else {
        return null;
    }
}

// -------- VARIABLES DU PROGRAMME -------------
var canvas, myCanvas ,gl, program;

var attribPos, attribColor, uniformPerspectiveMat,
    uniformTranslationMat, uniformRotationMat, uniformScaleMat;

var buffers = [], vertexPositions = [], vertexColors = [];

var translationValues = {x: 0, y: 0, z: 0};
var rotationValues = {x: 0, y: 0, z: 0};
var scaleFactor = 1.0;
var yFov = 75;
var cubeColor, altCubeColor;

var inputTranslationX, inputTranslationY, inputTranslationZ,
    inputRotationX, inputRotationY, inputRotationZ,
    inputZoom, inputPerspective,
    mouseClick = false,
    colorPickerWrapper, colorPicker, selectedColor = '#FFF';

function initContext() {
    canvas = document.getElementById('dawin-webgl');
    gl = canvas.getContext('webgl');
    if (!gl) {
        console.error('ERREUR : Échec du chargement du contexte');
        return;
    }
    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.clearDepth(1.0);
    gl.enable(gl.DEPTH_TEST);
}

function setCanvasResolution() {
    canvas.width = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
}

function initShaders() {
    var vertexShaderSource = loadText("assets/shaders/vertex.glsl");
    var fragmentShaderSource = loadText("assets/shaders/fragment.glsl");

    var vertexShader = gl.createShader(gl.VERTEX_SHADER);
    var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vertexShaderSource);
    gl.shaderSource(fragmentShader, fragmentShaderSource);

    gl.compileShader(vertexShader);
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(vertexShader));
    }

    gl.compileShader(fragmentShader);
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.log(gl.getShaderInfoLog(fragmentShader));
    }

    program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.log(gl.getProgramInfoLog(program));
    }

    gl.useProgram(program);
}

function initAttributes() {
    attribPos = gl.getAttribLocation(program, "position");
    attribColor = gl.getAttribLocation(program, "vertexColor");

    uniformPerspectiveMat = gl.getUniformLocation(program, "perspective");
    uniformTranslationMat = gl.getUniformLocation(program, "translation");
    uniformRotationMat = gl.getUniformLocation(program, "rotation");
    uniformScaleMat = gl.getUniformLocation(program, "scale");
}

function initBuffers() {
    var colorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribColor, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribColor);
    buffers["color"] = colorBuffer;

    var posBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
    gl.vertexAttribPointer(attribPos, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attribPos);
    buffers["pos"] = posBuffer;
}

function initializeCube() {
    vertexPositions = [
        // Face avant
        -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
        -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        // Face arrière
        -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0, -1.0,
        -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
        // Face haute
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        -1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
        // Face basse
        -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, -1.0,
        -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
        // Face gauche
        -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, -1.0, 1.0,
        -1.0, -1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0,
        // Face droite
        1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
        1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0
    ];

    vertexColors = [
        Array(6).fill([1.0, 0.0, 0.0]).flat(),      // Face avant
        Array(6).fill([0.0, 0.0, 1.0]).flat(),      // Face arrière
        Array(6).fill([0.0, 0.0, 0.0]).flat(),      // Face haute
        Array(6).fill([0.5, 0.5, 0.5]).flat(),      // Face basse
        Array(6).fill([1.0, 0.65, 0.0]).flat(),     // Face gauche
        Array(6).fill([0.0, 1.0, 0.0]).flat(),      // Face droite
    ].flat();
}

function initPerspective() {
    setCanvasResolution();

    var perspectiveMat = mat4.create();

    var fieldOfView = yFov * Math.PI / 180;
    var aspect = canvas.clientWidth / canvas.clientHeight;
    mat4.perspective(perspectiveMat, fieldOfView, aspect, 0.1, 100.0);

    gl.uniformMatrix4fv(uniformPerspectiveMat, false, perspectiveMat);
}

function initInputs() {
    inputTranslationX = $('#inputTranslationX').on('input', function(){
        translationValues.x = this.value;
    });

    inputTranslationY = $('#inputTranslationY').on('input', function(){
        translationValues.y = this.value;
    });

    inputTranslationZ = $('#inputTranslationZ').on('input', function(){
        translationValues.z = this.value;
    });

    inputRotationX = $('#inputRotationX').on('input', function(){
        rotationValues.x = this.value;
    });

    inputRotationY = $('#inputRotationY').on('input', function(){
        rotationValues.y = this.value;
    });

    inputRotationZ = $('#inputRotationZ').on('input', function(){
        rotationValues.z = this.value;
    });

    inputZoom = $('#inputZoom').on('input', function(){
        scaleFactor = this.value;
    });

    inputPerspective = $('#inputPerspective').on('input', function(){
        yFov = this.value;
        initPerspective();
    });

    colorPickerWrapper = $('#colorPicker')[0];
    initColorPicker();
}

function initMouseEvents() {
    myCanvas = $('#dawin-webgl');

    myCanvas.bind('mousewheel', function(e){
        if(e.originalEvent.wheelDelta /120 > 0) {
            scaleFactor = Math.min(scaleFactor + 0.02, 5);
        }
        else{
            scaleFactor = Math.max(scaleFactor - 0.02, 0.1);
        }
    });

    myCanvas.on('mousedown', function (){
        mouseClick = true
    });

    myCanvas.on('mouseup', function (){
        mouseClick = false
    });

    myCanvas.on('mouseleave', function (){
        mouseClick = false
    });

    myCanvas.on('mousemove', function (e){
        if (!mouseClick) {
            return;
        }
        rotationValues.x -= (event.movementY / 100);
        rotationValues.x = rotationValues.x - 2 * Math.PI * Math.floor((rotationValues.x + Math.PI) / (2 * Math.PI));
        inputRotationX.value = rotationValues.x;

        rotationValues.y -= (event.movementX / 100);
        rotationValues.y = rotationValues.y - 2 * Math.PI * Math.floor((rotationValues.y + Math.PI) / (2 * Math.PI));
        inputRotationY.value = rotationValues.y;
    });
}

function refreshTransformations() {
    var rotationMat = mat4.create();
    mat4.rotateX(rotationMat, rotationMat, -rotationValues.x);
    mat4.rotateY(rotationMat, rotationMat, -rotationValues.y);
    mat4.rotateZ(rotationMat, rotationMat, -rotationValues.z);
    gl.uniformMatrix4fv(uniformRotationMat, false, rotationMat);

    var translationMat = mat4.create();
    var translationVec = vec3.fromValues(translationValues.x, translationValues.y, translationValues.z - 5);
    mat4.fromTranslation(translationMat, translationVec);
    gl.uniformMatrix4fv(uniformTranslationMat, false, translationMat);

    var scaleMat = mat4.create();
    var scaleVec = vec3.fromValues(scaleFactor, scaleFactor, scaleFactor, 1);
    mat4.fromScaling(scaleMat, scaleVec);
    gl.uniformMatrix4fv(uniformScaleMat, false, scaleMat);
}

function initColorPicker() {
    colorPickerWrapper.innerHTML = '';

    colorPicker = new iro.ColorPicker(colorPickerWrapper, {
        color: selectedColor
    });

    colorPicker.on("color:change", function (color) {
        selectedColor = color.hexString.toUpperCase();

        cubeColor = Object.values(color.rgb).map(comp => comp / 255);
        altCubeColor = cubeColor.map(color => {
            if (color > 0.85){
                return color - 0.1;
            } return color + 0.1;
        });
        refreshColor();
    });
}

function refreshColor() {
    vertexColors = [
        Array(12).fill([altCubeColor[0], cubeColor[1], cubeColor[2]]).flat(),
        Array(12).fill([cubeColor[0], altCubeColor[1], cubeColor[2]]).flat(),
        Array(12).fill([cubeColor[0], cubeColor[1], altCubeColor[2]]).flat()
    ].flat();

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers["color"]);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexColors), gl.STATIC_DRAW);
}

function draw() {
    refreshTransformations();

    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, vertexPositions.length / 3);

    requestAnimationFrame(draw);
}

function main() {
    initContext();
    initShaders();
    initAttributes();
    initPerspective();
    initializeCube();
    initBuffers();
    initInputs();
    initMouseEvents();
    draw();

    $(window).on('resize', function () {
        initPerspective();
        initColorPicker();
    });
}