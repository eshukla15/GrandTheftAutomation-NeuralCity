class Car{
    constructor(x, y, width, height, controlType, maxSpeed=1.7){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0.0
        this.damaged = false;
        if (controlType != "DUMMY"){
            this.sensor = new Sensor(this);
        }       
        this.controls = new Controls(controlType);
    }
    
    update(roadBorders, traffic){
        if(!this.damaged){
            this.#move();
            this.polygon = this.#createPolygon();
            this.damaged = this.#assessDamage(roadBorders, traffic);
        }
        if(this.sensor){
            this.sensor.update(roadBorders, traffic);
        }
    }
    

    // ________________ <-width
    // |      |       /|
    // |      |      /r|
    // |      |     /a |
    // |      |    /d  |
    // |      |   /    |
    // |      |a /     |    <-height
    // |               |
    // |               |
    // |               |
    // |_______________|
    //for getting all points/edges of a car/polygon
    //can create complex polygon now
    #createPolygon(){
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2;
        const alpha = Math.atan2(this.width, this.height);
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad,
        });
        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad,
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math. PI + this.angle - alpha) * rad,
        });
        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math. PI + this.angle + alpha) * rad,
        });
        return points;
    }

    #assessDamage(roadBorders, traffic){
        for(let i = 0; i<roadBorders.length; i++){
            if(polysIntersect(this.polygon, roadBorders[i])){
                return true;
            }
        }
        for(let i = 0; i<traffic.length; i++){
            if(polysIntersect(this.polygon, traffic[i].polygon)){
                return true;
            }
        }
         return false
    }
    #move(){
        if(this.controls.forward){
            this.speed += this.acceleration;
        }
        if(this.controls.reverse){
            this.speed -= this.acceleration;
        }
        //maxspeed check
        if(this.speed < -this.maxSpeed/2){
            this.speed = -this.maxSpeed/2;
        }
        if(this.speed > this.maxSpeed){
            this.speed = this.maxSpeed;
        }
        //friction
        if(this.speed > 0){
            this.speed -= this.friction;
        }
        if(this.speed < 0){
            this.speed += this.friction;
        }
        //let it stop
        if(Math.abs(this.speed) < this.friction){
            this.speed = 0
        }
        //to stop rotating if car is not moving
        if(this.speed != 0){
            const flip = this.speed > 0 ? 1 : -1;
            //steering for left right
            if(this.controls.left){
                this.angle += 0.03 * flip;
            }
            if(this.controls.right){
                this.angle -= 0.03 * flip;
            }
        }
        

        //to move where its steered acc to unit circle
        //this.y = -this.speed..to have fun and drift
        this.x -= Math.sin(this.angle) * this.speed;
        this.y -= Math.cos(this.angle) * this.speed;
    }
        

    draw(ctx, clr){
        // ctx.save();
        // ctx.translate(this.x, this.y);  //centre of circle
        // ctx.rotate(-this.angle)
        // ctx.beginPath();
        // ctx.rect(
        //     -this.width/2,
        //     -this.height/2,
        //     this.width,
        //     this.height
        // );
        // ctx.fill();
        // ctx.restore();
        if(this.damaged){
            ctx.fillStyle = "red";
        }else{
            ctx.fillStyle = clr;
        }
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x, this.polygon[0].y)
        for(let i=1; i<this.polygon.length; i++){
            ctx.lineTo(this.polygon[i].x, this.polygon[i].y)
        }
        ctx.fill();
        
        if (this.sensor){
            this.sensor.draw(ctx);
        }
    }
}
        
