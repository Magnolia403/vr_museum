'use strict';
//导入data.js中的


(function() {
  //*** 第一步：准备工作  ***/
  //引入外部库与自己的数据
  var Marzipano = window.Marzipano;
  var bowser = window.bowser;
  var screenfull = window.screenfull;
  var data = window.APP_DATA;
  
 
  //从DOM中抓取元素准备操作
  var panoElement = document.querySelector('#pano');
  var sceneNameElement = document.querySelector('#titleBar .sceneName');
  var sceneListElement = document.querySelector('#sceneList');
  var sceneElements = document.querySelectorAll('#sceneList .scene');
  var sceneListToggleElement = document.querySelector('#sceneListToggle');
  var autorotateToggleElement = document.querySelector('#autorotateToggle');
  var fullscreenToggleElement = document.querySelector('#fullscreenToggle');
  var videoContainer = document.getElementById('videoContainer');
  var localVideoPlayer = document.getElementById('localVideoPlayer');
  // 获取新的视频容器和视频播放器的引用
  var newVideoContainer = document.getElementById('newVideoContainer');
  var newVideoPlayer = document.getElementById('newVideoPlayer');
  //初始网页中的状态设置
  window.current_commentary_video = null; //全局变量，储存当前音频对象或文件

  //暂时关闭背景视频，调试时太慢了。
  var Open_BG_video = true;
 
  var isInsertVideoPlaying = false; // 初始状态下数字人动作视频未播放
  //设置当前正在播放的数字人视频名称，默认为defaultVideo1.webm，刚进入网页时会进入默认等待交互的数字人视频中
  var currentPlayingVideoName = 'defaultVideo1.webm';

  //视频的锚点数据载入
  var anchorData =  window.anchorPoints;
  console.log(anchorData)
  //由于音频无法进入立即播放原因，所以第一次播放需要先交互。但是与下面的变量公用会导致逻辑很混乱实现不了自己的效果
  //最好就是第一次启动音频后这个变量我就不再用了。
  var firstStartBGM = false;
  //背景乐开启设置
  var isBackgroundMusicPlaying = false;
  


  //*** 第二步：兼容设置  ***/
  //控制桌面或移动模式
  if (window.matchMedia) {
    var setMode = function() {
      if (mql.matches) {
        document.body.classList.remove('desktop');
        document.body.classList.add('mobile');
      } else {
        document.body.classList.remove('mobile');
        document.body.classList.add('desktop');
      }
    };
    var mql = matchMedia("(max-width: 500px), (max-height: 500px)");
    setMode();
    mql.addListener(setMode);
  } else {
    document.body.classList.add('desktop');
  }
  //检测是否在触摸设备上
  document.body.classList.add('no-touch');
  window.addEventListener('touchstart', function() {
    document.body.classList.remove('no-touch');
    document.body.classList.add('touch');
  });
  //使用工具提示回退模式
  if (bowser.msie && parseFloat(bowser.version) < 11) {
    document.body.classList.add('tooltip-fallback');
  }

  //*** 第三步：生成全景场景  ***/

  // 查看器选项：查看器的提前参数设置
  var viewerOpts = {
    controls: {
      mouseViewMode: data.settings.mouseViewMode
    }
  };
  //初始化查看器
  var viewer = new Marzipano.Viewer(panoElement, viewerOpts);
  //创建场景
  var scenes = data.scenes.map(function(data) {
    //source资源路径：从哪找照片生成场景
    var urlPrefix = "tiles";
    var source = Marzipano.ImageUrlSource.fromString(
      urlPrefix + "/" + data.id + "/{z}/{f}/{y}/{x}.jpg",
      { cubeMapPreviewUrl: urlPrefix + "/" + data.id + "/preview.jpg" });
    //生成器参数设置
    var geometry = new Marzipano.CubeGeometry(data.levels);
    var limiter = Marzipano.RectilinearView.limit.traditional(data.faceSize, 100*Math.PI/180, 120*Math.PI/180);
    var view = new Marzipano.RectilinearView(data.initialViewParameters, limiter);
    //参数应用生成器
    var scene = viewer.createScene({
      source: source,
      geometry: geometry,
      view: view,
      pinFirstLevel: true
    });


    //创建链接热点
    data.linkHotspots.forEach(function(hotspot) {
      //生成转换热点
      var element = createLinkHotspotElement(hotspot);
      //放置转换热点
      scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
    });

    // Create info hotspots.创建信息热点
    data.infoHotspots.forEach(function(hotspot) {
      var element = createInfoHotspotElement(hotspot);
      scene.hotspotContainer().createHotspot(element, { yaw: hotspot.yaw, pitch: hotspot.pitch });
    });   //表明了控制视角


 
    if(Open_BG_video == true)
    {
      if(data.id == "6-img_4"){
        var container = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer = document.createElement('div');  // 创建新的容器
        document.body.appendChild(hotspotContainer); // 将容器添加到 body 中

        hotspotContainer.setAttribute('id', 'position-1'); // 添加视频嵌入位置属性
        
        // 设置虚拟电子屏的位置：俯仰角
        container.createHotspot(hotspotContainer, { yaw:  3.0429,pitch:-0.0023 },
          { perspective: { radius: 1680, extraTransforms: "rotateY(16deg) rotateX(0deg)"}});
       
      }
      
      if(data.id == "7-img_4_return"){
        var container = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer = document.createElement('div');  // 创建新的容器
        document.body.appendChild(hotspotContainer); // 将容器添加到 body 中
        hotspotContainer.setAttribute('id', 'position-1_return'); // 添加视频嵌入位置属性
        // 设置虚拟电子屏的位置：俯仰角
        container.createHotspot(hotspotContainer, { yaw:  3.0429,pitch:-0.0023 },
          { perspective: { radius: 1680, extraTransforms: "rotateY(16deg) rotateX(0deg)"}});
        var hotspotHtml =  '<iframe  width="800" height="580" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        hotspotContainer.innerHTML = hotspotHtml;
      }

      if(data.id == "42-img_22"){
        var container = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer = document.createElement('div');  // 创建新的容器
        //设置虚拟电子屏的位置：俯仰角
        hotspotContainer.setAttribute('id', 'position-2'); // 添加视频嵌入位置属性
        container.createHotspot(hotspotContainer, { yaw:  -1.52,pitch:0.035 },
          { perspective: { radius: 1780,  extraTransforms:"rotateY(5deg)"}});
      }

      if(data.id == "43-img_22_return"){
        var container = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer = document.createElement('div');  // 创建新的容器
        hotspotContainer.setAttribute('id', 'position-2_return'); // 添加视频嵌入位置属性
        //设置虚拟电子屏的位置：俯仰角
        container.createHotspot(hotspotContainer, { yaw:  -1.52,pitch:0.01 },
          { perspective: { radius: 1780,  extraTransforms:"rotateY(5deg)"}});
      }

      if(data.id == "45-img_24"){
        var container = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer = document.createElement('div');  // 创建新的容器
        hotspotContainer.setAttribute('id', 'position-3'); // 添加视频嵌入位置属性
        //设置虚拟电子屏的位置：俯仰角
        container.createHotspot(hotspotContainer, { yaw:  2.515,pitch:-0.019 },
          { perspective: { radius: 700,extraTransforms: "rotateY(-34deg) "}});
      }

      if(data.id == "46-img_24_return"){
        var container = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer = document.createElement('div');  // 创建新的容器
        hotspotContainer.setAttribute('id', 'position-3_return'); // 添加视频嵌入位置属性
        //设置虚拟电子屏的位置：俯仰角
        container.createHotspot(hotspotContainer, { yaw:  2.515,pitch:-0.019 },
          { perspective: { radius: 700,extraTransforms: "rotateY(-34deg) "}});
      }

      if(data.id == "51-img_27"){
        var container1 = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer1 = document.createElement('div');  // 创建新的容器
        hotspotContainer1.setAttribute('id', 'position-4'); // 添加视频嵌入位置属性
        //设置虚拟电子屏的位置：俯仰角
        container1.createHotspot(hotspotContainer1, { yaw:  1.45,pitch:-0.018 },
          { perspective: { radius: 1680,extraTransforms: "rotateY(-10deg) "}});
       
        var container2 = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer2 = document.createElement('div');  // 创建新的容器
        hotspotContainer2.setAttribute('id', 'position-5'); // 添加视频嵌入位置属性
        //设置虚拟电子屏的位置：俯仰角
        container2.createHotspot(hotspotContainer2, { yaw:  4.32,pitch:0.045 },
          { perspective: { radius: 3000,extraTransforms: "rotateY(-20deg) "}});
       
      }

      if(data.id == "52-img_27_return"){
        var container1 = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer1 = document.createElement('div');  // 创建新的容器
        hotspotContainer1.setAttribute('id', 'position-4_return'); // 添加视频嵌入位置属性
        //设置虚拟电子屏的位置：俯仰角
        container1.createHotspot(hotspotContainer1, { yaw:  1.45,pitch:-0.028 },
          { perspective: { radius: 1680,extraTransforms: "rotateY(-10deg) "}});
       

        var container2 = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer2 = document.createElement('div');  // 创建新的容器
        hotspotContainer2.setAttribute('id', 'position-5_return'); // 添加视频嵌入位置属性
        //设置虚拟电子屏的位置：俯仰角
        container2.createHotspot(hotspotContainer2, { yaw:  4.32,pitch:0.045 },
          { perspective: { radius: 3000,extraTransforms: "rotateY(-20deg) "}});
      }


      if(data.id == "53-img_28"){
        var container = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer = document.createElement('div');  // 创建新的容器
        hotspotContainer.setAttribute('id', 'position-6'); // 添加视频嵌入位置属性
        //设置虚拟电子屏的位置：俯仰角
        container.createHotspot(hotspotContainer, { yaw:  0.903,pitch:-0.004 },
          { perspective: { radius: 1500,extraTransforms: "rotateY(50deg) "}});
       
      }

      if(data.id == "54-img_28_return"){
        var container = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer = document.createElement('div');  // 创建新的容
        hotspotContainer.setAttribute('id', 'position-6_return'); // 添加视频嵌入位置属性
        //设置虚拟电子屏的位置：俯仰角
        container.createHotspot(hotspotContainer, { yaw:  0.903,pitch:-0.004 },
          { perspective: { radius: 1500,extraTransforms: "rotateY(50deg) "}});
       
      }
      if(data.id == "55-img_29"){
        var container = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer = document.createElement('div');  // 创建新的容
        hotspotContainer.setAttribute('id', 'position-7'); // 添加视频嵌入位置属性
        //设置虚拟电子屏的位置：俯仰角
        container.createHotspot(hotspotContainer, { yaw:  2.5655,pitch:-0.0035 },
          { perspective: { radius: 2300,extraTransforms: "rotateY(57deg)"}});
        
      }
      if(data.id == "56-img_29_return"){
        var container = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer = document.createElement('div');  // 创建新的容
        hotspotContainer.setAttribute('id', 'position-7_return'); // 添加视频嵌入位置属性
        //设置虚拟电子屏的位置：俯仰角
        container.createHotspot(hotspotContainer, { yaw:  2.5655,pitch:0.0035 },
          { perspective: { radius: 2300,extraTransforms: "rotateY(57deg)"}});
        
      }

      if(data.id == "60-img_32"){
        var container = scene.hotspotContainer();  //创建了一个控制器
        var hotspotContainer = document.createElement('div');  // 创建新的容
        hotspotContainer.setAttribute('id', 'position-8'); // 添加视频嵌入位置属性
        //设置虚拟电子屏的位置：俯仰角
        container.createHotspot(hotspotContainer, { yaw:  -1.42,pitch:0.15 },
          { perspective: { radius: 1950,extraTransforms: "rotateX(-1deg)"}});
       
      }
      
     
    }
//var hotspotHtml =  '<iframe  width="680" height="460" src="https://t.bilibili.com/600268812597175755?spm_id_from=333.999.0.0" frameborder="0" style="border:0" ></iframe>';

   

    //第三步：创建虚拟电子屏幕：当在 "51-img_27"这个场景下时才会进行虚拟电子屏幕的设置
    if(data.id == "51-img_27"){
      var container = scene.hotspotContainer();  //创建了一个控制器
      //设置虚拟电子屏的位置：俯仰角
      container.createHotspot(document.getElementById('iframespot'), { yaw: 0.0135,pitch: -0.080 },
        { perspective: { radius: 1640, extraTransforms: "rotateX(5deg)" }});
      //设置左侧的选择元素（列表）的位置  
      container.createHotspot(document.getElementById('iframeselect'), { yaw: -0.69, pitch: -0.239 });
      //设置不同的元素
      var hotspotHtml = {
        past_master: '<iframe id="past_master" width="2900" height="600" src="./important_figure/0/index.html" frameborder="0" allowfullscreen></iframe>',
        past_secretary: '<iframe id="past_secretary" width="2900" height="600" src="./important_figure/1/index.html" frameborder="0" allowfullscreen></iframe>',
        past_vice_secretary: '<iframe id="past_vice_secretary" width="2900" height="600" src="./important_figure/2/index.html" width="600" height="450" frameborder="0" style="border:0"></iframe>',
        past_vice_master: '<iframe id="past_vice_master" src="./important_figure/3/index.html" type="text/html" width="2900" height="600" frameborder="0" > </iframe>',
        past_training: '<iframe id="past_training" src="./important_figure/4/index.html" type="text/html" width="2900" height="600" frameborder="0" > </iframe>',
        video_source: '<iframe id="youtube" width="900" height="600" src="index3.html" frameborder="0" allowfullscreen></iframe>',
       
      };

      var switchElements = document.querySelectorAll('[data-source]');
      for (var i = 0; i < switchElements.length; i++) {
        var element = switchElements[i];
        addClickEvent(element);//点击元素
        if(i==0){
          switchHotspot(element.getAttribute('data-source'));
        }
      }
      

      function addClickEvent(element) {
        element.addEventListener('click', function() {
          switchHotspot(element.getAttribute('data-source'));
        });
      }

       // Switch sources when clicked.当点击的时候的转换情况
       function switchHotspot(id) {
        var wrapper = document.getElementById('iframespot');
        wrapper.innerHTML = hotspotHtml[id]; 
      }
    }

    
    return {
      data: data,
      scene: scene,
      view: view
    };
  });

 
  
  // Set up autorotate, if enabled.设置自转情况
  var autorotate = Marzipano.autorotate({        //角度情况
    yawSpeed: 0.03,
    targetPitch: 0,
    targetFov: Math.PI/2
  });
  if (data.settings.autorotateEnabled) {
    autorotateToggleElement.classList.add('enabled');
  }

  // Set handler for autorotate toggle.点击时的控制器
  autorotateToggleElement.addEventListener('click', toggleAutorotate);

  // Set up fullscreen mode, if supported.
  if (screenfull.enabled && data.settings.fullscreenButton) {
    document.body.classList.add('fullscreen-enabled');
    fullscreenToggleElement.addEventListener('click', function() {
      screenfull.toggle();
    });
    screenfull.on('change', function() {
      if (screenfull.isFullscreen) {
        fullscreenToggleElement.classList.add('enabled');
      } else {
        fullscreenToggleElement.classList.remove('enabled');
      }
    });
  } else {
    document.body.classList.add('fullscreen-disabled');
  }

  // Set handler for scene list toggle.
  sceneListToggleElement.addEventListener('click', toggleSceneList);

  // Start with the scene list open on desktop.
  if (!document.body.classList.contains('mobile')) {
    showSceneList();
  }

  // Set handler for scene switch.
  scenes.forEach(function(scene) {
    var el = document.querySelector('#sceneList .scene[data-id="' + scene.data.id + '"]');
    el.addEventListener('click', function() {
      switchScene(scene);
      // On mobile, hide scene list after selecting a scene.
      if (document.body.classList.contains('mobile')) {
        hideSceneList();
      }
    });
  });

  // DOM elements for view controls.场景的设置
  var viewUpElement = document.querySelector('#viewUp');
  var viewDownElement = document.querySelector('#viewDown');
  var viewLeftElement = document.querySelector('#viewLeft');
  var viewRightElement = document.querySelector('#viewRight');
  var viewInElement = document.querySelector('#viewIn');
  var viewOutElement = document.querySelector('#viewOut');

  // Dynamic parameters for controls.
  var velocity = 0.7;
  var friction = 3;

  // Associate view controls with elements.
  var controls = viewer.controls();
  controls.registerMethod('upElement',    new Marzipano.ElementPressControlMethod(viewUpElement,     'y', -velocity, friction), true);
  controls.registerMethod('downElement',  new Marzipano.ElementPressControlMethod(viewDownElement,   'y',  velocity, friction), true);
  controls.registerMethod('leftElement',  new Marzipano.ElementPressControlMethod(viewLeftElement,   'x', -velocity, friction), true);
  controls.registerMethod('rightElement', new Marzipano.ElementPressControlMethod(viewRightElement,  'x',  velocity, friction), true);
  controls.registerMethod('inElement',    new Marzipano.ElementPressControlMethod(viewInElement,  'zoom', -velocity, friction), true);
  controls.registerMethod('outElement',   new Marzipano.ElementPressControlMethod(viewOutElement, 'zoom',  velocity, friction), true);

  function sanitize(s) {
    return s.replace('&', '&amp;').replace('<', '&lt;').replace('>', '&gt;');
  }

  function switchScene(scene) {
    stopAutorotate();
    scene.view.setParameters(scene.data.initialViewParameters);
    scene.scene.switchTo();
    startAutorotate();
    updateSceneName(scene);
    updateSceneList(scene);
    console.log(scene.data.id);

    if (firstStartBGM == false){
      var backgroundAudio = document.getElementById("bgAudio");
      backgroundAudio.play();
      firstStartBGM = true;
      isBackgroundMusicPlaying = true;
    }
   
    switch(scene.data.id)
    {
      //第一个嵌入点（包括返回场景）
      case'6-img_4':
        var container = document.getElementById('position-1'); 
        var hotspotHtml =  '<iframe  width="800" height="580" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        container.innerHTML = hotspotHtml;
        //var iframeHtml = '<iframe width="680" height="460" src="https://t.bilibili.com/600268812597175755?spm_id_from=333.999.0.0" frameborder="0" style="border:0"></iframe>';
        //container.innerHTML = iframeHtml;
        break;
      case '7-img_4_return':
        var container = document.getElementById('position-1_return'); 
        var hotspotHtml =  '<iframe  width="800" height="580" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        container.innerHTML = hotspotHtml;
        break;
      //第二个
      case  "42-img_22":
        var container = document.getElementById('position-2'); 
        var hotspotHtml =  '<iframe  width="780" height="570" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        container.innerHTML = hotspotHtml;
        break;
      case"43-img_22_return":
        var container = document.getElementById('position-2_return'); 
        var hotspotHtml =  '<iframe  width="740" height="470" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        container.innerHTML = hotspotHtml;
      //第三个
      case "45-img_24":
        var container = document.getElementById('position-3'); 
        var hotspotHtml =  '<iframe  width="740" height="470" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        container.innerHTML = hotspotHtml;
        break;
      case "46-img_24_return":
        var container = document.getElementById('position-3_return'); 
        var hotspotHtml =  '<iframe  width="740" height="470" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        container.innerHTML = hotspotHtml;
        break;
      //第四个和第五个一起
      case"51-img_27":
        var container1 = document.getElementById('position-4'); 
        var container2 = document.getElementById('position-5'); 
        var hotspotHtml1 =  '<iframe  width="740" height="500" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        var hotspotHtml2 =  '<iframe  width="740" height="800" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        container1.innerHTML = hotspotHtml1;
        container2.innerHTML = hotspotHtml2;
        console.log("嵌入成功")
        break;
      case "52-img_27_return":
        var container1 = document.getElementById('position-4_return'); 
        var container2 = document.getElementById('position-5_return'); 
        var hotspotHtml1 =  '<iframe  width="740" height="470" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        var hotspotHtml2 =  '<iframe  width="740" height="800" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        container1.innerHTML = hotspotHtml1;
        container2.innerHTML = hotspotHtml2;
        break;
      //第六个
      case  "53-img_28":
        var container = document.getElementById('position-6'); 
        var hotspotHtml =  '<iframe  width="580" height="470" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        container.innerHTML = hotspotHtml;
        break;
      case"54-img_28_return":
        var container = document.getElementById('position-6_return'); 
        var hotspotHtml =  '<iframe  width="740" height="470" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        container.innerHTML = hotspotHtml;
        break;
      //第七个
      case "55-img_29":
        var container = document.getElementById('position-7'); 
        var hotspotHtml =  '<iframe  width="760" height="460" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        container.innerHTML = hotspotHtml;
        break;
      case "56-img_29_return":
        var container = document.getElementById('position-7_return'); 
        var hotspotHtml =  '<iframe  width="740" height="470" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        container.innerHTML = hotspotHtml;
        break;
      //第八个
      case"60-img_32":
        var container = document.getElementById('position-8'); 
        var hotspotHtml =  '<iframe  width="680" height="460" src="./BG_video/BG_video_index.html" frameborder="0" style="border:0" ></iframe>';
        container.innerHTML = hotspotHtml;
        break;
    default:
      return;
    }
    
  }
  

  function updateSceneName(scene) {
    sceneNameElement.innerHTML = sanitize(scene.data.name);
  }

  function updateSceneList(scene) {
    for (var i = 0; i < sceneElements.length; i++) {
      var el = sceneElements[i];
      if (el.getAttribute('data-id') === scene.data.id) {
        el.classList.add('current');
      } else {
        el.classList.remove('current');
      }
    }
  }

  function showSceneList() {
    sceneListElement.classList.add('enabled');
    sceneListToggleElement.classList.add('enabled');
  }

  function hideSceneList() {
    sceneListElement.classList.remove('enabled');
    sceneListToggleElement.classList.remove('enabled');
  }

  function toggleSceneList() {
    sceneListElement.classList.toggle('enabled');
    sceneListToggleElement.classList.toggle('enabled');
  }

  function startAutorotate() {
    if (!autorotateToggleElement.classList.contains('enabled')) {
      return;
    }
    viewer.startMovement(autorotate);
    viewer.setIdleMovement(3000, autorotate);
  }

  function stopAutorotate() {
    viewer.stopMovement();
    viewer.setIdleMovement(Infinity);
  }

  function toggleAutorotate() {
    if (autorotateToggleElement.classList.contains('enabled')) {
      autorotateToggleElement.classList.remove('enabled');
      stopAutorotate();
    } else {
      autorotateToggleElement.classList.add('enabled');
      startAutorotate();
    }
  }
  
  
    
  

  function createLinkHotspotElement(hotspot) {
    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('link-hotspot');

    var icon = document.createElement('img');
    icon.src = 'img/link.png';
    icon.classList.add('link-hotspot-icon');

    var transformProperties = [ '-ms-transform', '-webkit-transform', 'transform' ];
    for (var i = 0; i < transformProperties.length; i++) {
      var property = transformProperties[i];
      icon.style[property] = 'rotate(' + hotspot.rotation + 'rad)';
    }

    wrapper.addEventListener('click', function() {
      switchScene(findSceneById(hotspot.target));
    });

    stopTouchAndScrollEventPropagation(wrapper);
    
    var tooltip = document.createElement('div');
    tooltip.classList.add('hotspot-tooltip');
    tooltip.classList.add('link-hotspot-tooltip');
    tooltip.innerHTML = findSceneDataById(hotspot.target).name;
    
    wrapper.appendChild(icon);
    wrapper.appendChild(tooltip);

    return wrapper;
  }

  function createInfoHotspotElement(hotspot) {

    var wrapper = document.createElement('div');
    wrapper.classList.add('hotspot');
    wrapper.classList.add('link-hotspot');

    var icon = document.createElement('img');
    icon.src = 'img/info.png';
    icon.classList.add('link-hotspot-icon');

    
    wrapper.appendChild(icon);
  


    wrapper.addEventListener('click', function() {
      if (isInsertVideoPlaying) {
        // 如果插入视频正在播放，不执行任何操作
        return;
    }
      console.count("点击了信息交互图标")
      localVideoPlayer.controls = false
      localVideoPlayer.controlsList.add('nodownload'); // 禁止下载按钮
      localVideoPlayer.controlsList.add('nofullscreen'); // 禁止全屏按钮
      videoContainer.style.display = 'block'
      
      //设置视频播放
      localVideoPlayer.src = "video/video" + hotspot.title + ".webm";
      localVideoPlayer.loop = false;
      localVideoPlayer.play();

      console.count("之前播放的是"+currentPlayingVideoName);
      console.count("现在播放的是"+"video" + hotspot.title + ".webm");

      currentPlayingVideoName = "video" + hotspot.title + ".webm"
      
    });
    
    stopTouchAndScrollEventPropagation(wrapper);
    return wrapper;
  }


  // Prevent touch and scroll events from reaching the parent element.
  function stopTouchAndScrollEventPropagation(element, eventList) {
    var eventList = [ 'touchstart', 'touchmove', 'touchend', 'touchcancel',
                      'wheel', 'mousewheel' ];
    for (var i = 0; i < eventList.length; i++) {
      element.addEventListener(eventList[i], function(event) {
        event.stopPropagation();
      });
    }
  }

  function findSceneById(id) {
    for (var i = 0; i < scenes.length; i++) {
      if (scenes[i].data.id === id) {
        return scenes[i];
      }
    }
    return null;
  }

  function findSceneDataById(id) {
    for (var i = 0; i < data.scenes.length; i++) {
      if (data.scenes[i].id === id) {
        return data.scenes[i];
      }
    }
    return null;
  }

  //UI部分
  document.addEventListener('DOMContentLoaded', function () {
    // 获取按钮元素
    const infoButton = document.getElementById('info-button');
    const pluginButton = document.getElementById('plugin-button');
    const settingButton = document.getElementById('setting-button');

    const infoList = document.getElementById('info-list');
    const pluginList = document.getElementById('plugin-list');
    const settingList = document.getElementById('setting-list');

    // 添加点击事件监听器
    infoButton.addEventListener('click', function () {
        playPressSound();
        console.log('Info button clicked');
        toggleList(infoList);
      
      
    });

    pluginButton.addEventListener('click', function () {
        playPressSound();
        console.log('Plugin button clicked');
        toggleList(pluginList);
       
       
    });

    settingButton.addEventListener('click', function () {
        playPressSound();
        console.log('Setting button clicked');
        toggleList(settingList);
    
        
    });


     // 添加小按钮的点击事件监听器
     setupSmallButtonListeners(infoList, 'info');
     setupSmallButtonListeners(pluginList, 'plugin');
     setupSmallButtonListeners(settingList, 'settings');


let currentList = null;
function toggleList(list) {
    if (currentList !== list) {
        hideList(currentList); // 隐藏当前显示的列表
        showList(list); // 显示新的列表
    } else {
        hideList(list); // 隐藏当前列表
    }
}

function showList(list) {
    list.classList.remove('fade-out');
    list.classList.add('fade-in');
    list.style.display = 'block'; // 显示列表
    currentList = list;
}

function hideList(list) {
    if (list) {
        list.classList.remove('fade-in');
        list.classList.add('fade-out');
        list.addEventListener('animationend', function onAnimationEnd() {
            list.style.display = 'none'; // 动画结束后隐藏列表
            list.removeEventListener('animationend', onAnimationEnd);
        }, { once: true });
        currentList = null;
    }
}

function setupSmallButtonListeners(list, listName) {
  const smallButtons = list.getElementsByClassName('small-button');

  for (let i = 0; i < smallButtons.length; i++) {
      const smallButton = smallButtons[i];
      smallButton.addEventListener('click', function () {
          handleSmallButtonClick(listName, i + 1);
      });
  }
}

function handleSmallButtonClick(listType, buttonNumber) {
  // 根据按钮类型执行相应的逻辑
  switch (listType) {
      case 'info':
          meta_Human_action(`Info Small Button ${buttonNumber}`);
          //console.log(`Info Small Button ${buttonNumber}`)
          break;
      case 'plugin':
          switch_scene(`Plugin Small Button ${buttonNumber}`);
          //console.log(`Plugin Small Button ${buttonNumber}`)
          break;
      case 'settings':
          settings(`Settings Small Button ${buttonNumber}`);
         // console.log(`Settings Small Button ${buttonNumber}`)
          break;
      default:
          console.error('Unknown button type');
  }
}



  // 添加点击按钮时的音效
  function playPressSound() {
    const pressSound = new Audio('sounds/press.wav');
    pressSound.play();
}
});

//标定现在是否触发了动作视频的插入
var isInsertVideo = false;
 // 初始化目标锚点为null
 var targetAnchor = null;
// 定义全局变量用于存储点击的动作视频按钮
var actionsButtonName = null;
function meta_Human_action(listName)
{
  actionsButtonName = listName;
  console.log(listName);
  
  if (isInsertVideoPlaying) {
    // 如果插入视频正在播放，不执行任何操作
    return;
  }
//得到当前视频的时间点，播放到下一个锚点
    //得到当前视频的时间点
    var currentVideoTime =  localVideoPlayer.currentTime;
    console.log("视频已经播放了"+currentVideoTime+'秒');
    //得到当前视频对应的锚点数据---匹配数据
    // 获取当前播放视频对应的锚点数据
    var currentPlayingVideoAnchor = anchorData[currentPlayingVideoName];
    console.log(currentPlayingVideoAnchor);

    // 遍历当前播放视频对应的锚点数据
    var foundAnchor = false;
    for (var i = 0; i < currentPlayingVideoAnchor.length; i++) {
        // 如果找到第一个比当前视频时间大的锚点，则设置为目标锚点，并跳出循环
        if (currentPlayingVideoAnchor[i] > currentVideoTime) {
            targetAnchor = currentPlayingVideoAnchor[i];
            foundAnchor = true;
            break;
        }
    }

    // 如果未找到比当前视频时间大的锚点，则目标锚点为当前视频总长度
    if (!foundAnchor) {
        targetAnchor = localVideoPlayer.duration;
    }

    // 打印目标锚点
    console.log('目标锚点：', targetAnchor);

    //确定插入flag得到了目标锚点，开始准备插入
    isInsertVideo = true;



  }

  //监听视频是否到达了锚点位置
  localVideoPlayer.addEventListener('timeupdate', function() {
    // 获取当前视频的播放时间
    var currentTime = localVideoPlayer.currentTime;
    // 定义允许的时间误差范围
    var tolerance = 0.1; // 可以根据实际情况调整
    
    // 判断当前时间是否接近目标锚点
    if (Math.abs(currentTime - targetAnchor) <= tolerance && isInsertVideo === true) {
        console.log("到达了锚点位置。现在锚点时间为" + currentTime);
          // 停止视频播放
        localVideoPlayer.pause();
        console.log("视频已停止播放");
          // 隐藏视频容器
        videoContainer.style.display = 'none';
        console.log("原视频已隐藏");
        // 显示新的视频容器
        newVideoPlayer.controls = false
        newVideoPlayer.controlsList.add('nodownload'); // 禁止下载按钮
        newVideoPlayer.controlsList.add('nofullscreen'); // 禁止全屏按钮 
        newVideoContainer.style.display = 'block';
         // 根据 listName 设置不同的视频源
        var videoSource;
        if (actionsButtonName === "Info Small Button 1") {
          videoSource = "actions/insert1.webm";
        } else if (actionsButtonName === "Info Small Button 2") {
          videoSource = "actions/insert2.webm";
        } else if (actionsButtonName === "Info Small Button 3") {
          videoSource = "actions/insert3.webm";
        } else if (actionsButtonName === "Info Small Button 4") {
          videoSource = "actions/insert4.webm";
        } else {
          // 默认的视频源，可以根据实际情况设置
          videoSource = "actions/default.webm";
        }

        newVideoPlayer.src =videoSource;
        newVideoPlayer.play();
        console.log("插入视频"+videoSource)
        isInsertVideoPlaying = true;
    
        //取消插入flag
        isInsertVideo = false;
    }

});


//监测插入视频是否结束
 // 监听新视频播放完的事件
 newVideoPlayer.addEventListener('ended', function() {
  // 设置插入视频播放状态为 false
  isInsertVideoPlaying = false;

   // 隐藏插入视频容器
  newVideoContainer.style.display = 'none';
  console.log("插入视频容器已隐藏");

  // 显示原视频容器
  videoContainer.style.display = 'block';
  console.log("原视频已显示");

  // 恢复原视频播放
  localVideoPlayer.play();
  console.log("原视频已恢复播放");
});
  //监测讲解视频是否结束
  localVideoPlayer.addEventListener('ended', function() {
    console.log("讲解视频结束");
    defaultVideoPlay();
});


function defaultVideoPlay(){
  //设置最初始状态的数字人视频，即默认等待交互的视频。当前视频源需要修改，并且设置一些细节
  localVideoPlayer.src = 'video/默认女.webm';
  localVideoPlayer.controls = false
  localVideoPlayer.controlsList.add('nodownload'); // 禁止下载按钮
  localVideoPlayer.controlsList.add('nofullscreen'); // 禁止全屏按钮
  localVideoPlayer.loop = true; // 设置视频循环播放
  currentPlayingVideoName = 'defaultVideo1.webm';
}

function switch_scene(listName){
  console.log(listName);
  switch(listName)
  {
    case 'Plugin Small Button 1':
      //校史馆入口  
      switchScene(scenes[0]);
      break;
    case 'Plugin Small Button 2':
      //前门  
      switchScene(scenes[3]);
      break;
    case 'Plugin Small Button 3':
      //进入
      switchScene(scenes[6]);
      break;
  
    case 'Plugin Small Button 4':
      //进入
      switchScene(scenes[8]);
      break;
   
    case 'Plugin Small Button 5':
      //进入
      switchScene(scenes[16]);
      break;
      
    case 'Plugin Small Button 6':
      //进入
      switchScene(scenes[22]);
      break;
     
    case 'Plugin Small Button 7':
      //进入
      switchScene(scenes[28]);
      break;
      
    case 'Plugin Small Button 8':
      //进入
      switchScene(scenes[36]);
      break;
      
    case 'Plugin Small Button 9':
      //进入
      switchScene(scenes[46]);
      break;
      
    case 'Plugin Small Button 10':
      //进入
      switchScene(scenes[47]);
      break;
      
    case 'Plugin Small Button 11':
      //进入
      switchScene(scenes[51]);
      break;
   
    case 'Plugin Small Button 12':
      //进入
      switchScene(scenes[53]);
      break;
      
    case 'Plugin Small Button 13':
      //进入
      switchScene(scenes[55]);
      break;
      
    case 'Plugin Small Button 14':
      //进入
      switchScene(scenes[57]);
      break;
    
    case 'Plugin Small Button 15':
      //进入
      switchScene(scenes[60]);
      break;   

    case 'Plugin Small Button 16':
      //进入
      switchScene(scenes[58]);
      break;  
      
   case 'Plugin Small Button 17':
      //进入
      switchScene(scenes[63]);
      break;     
  }
  console.log("场景切换测试");
}

function settings(listName){
  if (listName == "Settings Small Button 1")
  {
    toggleAutorotate();
  }
  if (listName == "Settings Small Button 2")
  {
    screenfull.toggle();
  }
  if (listName == "Settings Small Button 3")
  {
    var backgroundAudio = document.getElementById("bgAudio");
    if (isBackgroundMusicPlaying) {
      backgroundAudio.pause(); // 暂停背景音乐
      isBackgroundMusicPlaying = false; // 设置状态为关闭
    } else {
      backgroundAudio.play(); // 播放背景音乐
      isBackgroundMusicPlaying = true; // 设置状态为开启
  }
  }
  console.log("seetings测试");
  console.log(listName);

}
  //初始场景
  
  defaultVideoPlay();
  switchScene(scenes[6]);
  //虚拟屏测试场景
  //switchScene(scenes[51]);
  //视频嵌入测试场景
  //switchScene(scenes[3])
  //交互网页测试场景
  //switchScene(scenes[56])
})();
