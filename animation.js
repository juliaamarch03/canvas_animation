(function() { "use strict";
  //розмір кожного кадру спрайта
  const SPRITE_SIZE = 16;
  var Animation = function(frame_set, delay) {};

  Animation.prototype = {
    //зміна поточних кадрів спрайта
    change:function(frame_set, delay = 15) {
      //якщо набір кадрів різний
      if (this.frame_set != frame_set) {
        this.count = 0;
        this.delay = delay; //встановлення затримки
        this.frame_index = 0; //початок з 1 кадру в новому наборі
        this.frame_set = frame_set;//новий кадр
        this.frame = this.frame_set[this.frame_index];//встановлення нового значення кадру
      }
    },

    /*обов'язковий виклик функції в кожному ігровому циклі*/
    update:function() {
      this.count ++;//Відстеження, скільки циклів пройшло з моменту останньої зміни кадру.
      if (this.count >= this.delay) {//якщо пройшло достатньо циклів, ми змінюємо кадр
        this.count = 0;
        /* Якщо індекс кадру знаходиться на останньому значенні у наборі кадрів, скинути його на 0.
         Якщо індекс кадру не на останньому значенні, просто додати до нього 1. */
        this.frame_index = (this.frame_index == this.frame_set.length - 1) ? 0 : this.frame_index + 1;
        this.frame = this.frame_set[this.frame_index];//зміна поточного значення кадру
      }
    }
  };

  var buffer, controller, display, loop, player, render, resize, sprite_sheet;

  buffer = document.createElement("canvas").getContext("2d");
  display = document.querySelector("canvas").getContext("2d");

  //контроль клавіш
  controller = {
    left:  { active:false, state:false },
    right: { active:false, state:false },
    up:    { active:false, state:false },
    //дії з клавішами
    keyUpDown:function(event) {
      var key_state = (event.type == "keydown") ? true : false;
      switch(event.keyCode) {
        case 37:// ліва клавіша
          if (controller.left.state != key_state) controller.left.active = key_state;
          controller.left.state  = key_state;// Always update the physical state.
        break;
        case 38://клавіша вверх
          if (controller.up.state != key_state) controller.up.active = key_state;
          controller.up.state  = key_state;
        break;
        case 39://права клавіша
          if (controller.right.state != key_state) controller.right.active = key_state;
          controller.right.state  = key_state;
        break;
      }
    }
};

//керування персонажем
  player = {
    animation:new Animation(),
    jumping:true,
    height:16,    width:16,
    x:0,          y:40 - 18,
    x_velocity:0, y_velocity:0
  };

  //Набір кадрів анімації - це просто масив значень кадру
  sprite_sheet = {
    frame_sets:[[0, 1], [2, 3], [4, 5]],// стоїть на місці, йде вправо, йде вліво
    image:new Image()
  };

  loop = function(time_stamp) {

    //якщо персонаж скаче вверх
    if (controller.up.active && !player.jumping) {
      controller.up.active = false;
      player.jumping = true;
      player.y_velocity -= 2.5;
    }

    //якщо персонаж йде вліво
    if (controller.left.active) {
      player.animation.change(sprite_sheet.frame_sets[2], 15);
      player.x_velocity -= 0.05;
    }

    //якщо персонаж йде вправо
    if (controller.right.active) {
      player.animation.change(sprite_sheet.frame_sets[1], 15);
      player.x_velocity += 0.05;
    }

    //у випадку, якщо персонаж стоїть на місці
    if (!controller.left.active && !controller.right.active) {
      player.animation.change(sprite_sheet.frame_sets[0], 20);
    }

    player.y_velocity += 0.25;

    player.x += player.x_velocity;
    player.y += player.y_velocity;
    player.x_velocity *= 0.9;
    player.y_velocity *= 0.9;

    if (player.y + player.height > buffer.canvas.height - 2) {
      player.jumping = false;
      player.y = buffer.canvas.height - 2 - player.height;
      player.y_velocity = 0;
    }

    if (player.x + player.width < 0) {
      player.x = buffer.canvas.width;
    } else if (player.x > buffer.canvas.width) {
      player.x = - player.width;
    }

    player.animation.update();
    render();
    window.requestAnimationFrame(loop);
  };

  render = function() {
    //фон
    buffer.fillStyle = "#9ABDDD";
    buffer.fillRect(0, 0, buffer.canvas.width, buffer.canvas.height);
    buffer.fillStyle = "#7F7D7E";
    buffer.fillRect(0, 36, buffer.canvas.width, 4);

    //відображення спрайта на канвасі
    buffer.drawImage(sprite_sheet.image, player.animation.frame * SPRITE_SIZE, 0, SPRITE_SIZE, SPRITE_SIZE, Math.floor(player.x), Math.floor(player.y), SPRITE_SIZE, SPRITE_SIZE);
    display.drawImage(buffer.canvas, 0, 0, buffer.canvas.width, buffer.canvas.height, 0, 0, display.canvas.width, display.canvas.height);
  };

  resize = function() {
    display.canvas.width = document.documentElement.clientWidth - 32;
    if (display.canvas.width > document.documentElement.clientHeight) {
      display.canvas.width = document.documentElement.clientHeight;
    }

    display.canvas.height = display.canvas.width * 0.5;
    display.imageSmoothingEnabled = false;
  };

  //ініціалізація//
  buffer.canvas.width = 80;
  buffer.canvas.height = 40;
  window.addEventListener("resize", resize);
  window.addEventListener("keydown", controller.keyUpDown);
  window.addEventListener("keyup", controller.keyUpDown);
  resize();

  sprite_sheet.image.addEventListener("load", function(event){
  window.requestAnimationFrame(loop);//початок циклу гри
});
  sprite_sheet.image.src = "animation.png";
})();
