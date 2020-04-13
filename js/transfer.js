function Transfer(
  x1,
  y1,
  x2,
  y2,
  color,
  country,
  launchAnim,
  noAnim,
  mapWidth,
) {
  //set default values if undefined
  if (x1 === undefined) {
    x1 = 0
  }
  if (y1 === undefined) {
    y1 = 0
  }
  if (x2 === undefined) {
    x2 = 0
  }
  if (y2 === undefined) {
    y2 = 0
  }
  if (color === undefined) {
    color = "#ff0000"
  }
  if (launchAnim === undefined) {
    launchAnim = false
  }
  if (noAnim === undefined) {
    noAnim = false
  }
  if (country === undefined) {
    country = false
  }
  if (mapWidth === undefined) {
    mapWidth = false
  }

  //don't animate this if it's not set well
  if (x1 == 0 && y1 == 0 && x2 == 0 && y2 == 0) {
    this.active = false
  } else {
    this.active = true
  }

  //starting position of arc
  this.x1 = x1
  this.y1 = y1

  //ending position of arc
  this.x2 = x2
  this.y2 = y2

  //control/mid point for quadratic curve or Bezier curve
  this.xMid = this.x1 + (this.x2 - this.x1) / 2

  //ensure arc is upright, looks funny otherwise
  if (this.x1 < this.x2) {
    this.yMid = this.y1 + (this.y2 - this.y1) / 2 - (this.x2 - this.x1) / 3 //last number controls the upward curve amount ;)
  } else {
    this.yMid = this.y1 + (this.y2 - this.y1) / 2 + (this.x2 - this.x1) / 3 //last number controls the upward curve amount ;)
  }

  //animation point
  this.x = x1
  this.y = y1

  //mode determines what to animate
  //launch: fly along arc
  //hit: animate a nice landing effect once ariving at destination
  this.mode = "launch"

  //launch animation at beginning? (otherwise there's a "hit" animation at the end)
  this.launchAnim = launchAnim
  this.noAnim = noAnim

  this.country = country
  this.animCountry = false //changing to true will trigger a country to be highlighted by parent, then set back to false

  //time percentage, used to manage position of transfer circle along arc
  this.t = 0
  this.tInc = 0.007 //!!! should this be calculated based on frame rate test?
  this.lt = 0
  this.ltInc = 0.03

  //other settings
  //!!! should I include scale for map scale matching purposes?
  this.lineWidth = 1
  this.radius = 2
  this.color = color
  this.scale = 1.0

  this.mapWidth = mapWidth //offset animation by half a map
}

Transfer.prototype.draw = function(context) {
  var tmpX
  if (this.active == true) {
    if (this.mode == "launch") {
      //calculate position along Bezier curve
      //ref: http://stackoverflow.com/questions/5634460/quadratic-bezier-curve-calculate-point
      this.x =
        (1 - this.t) * (1 - this.t) * this.x1 +
        2 * (1 - this.t) * this.t * this.xMid +
        this.t * this.t * this.x2
      this.y =
        (1 - this.t) * (1 - this.t) * this.y1 +
        2 * (1 - this.t) * this.t * this.yMid +
        this.t * this.t * this.y2

      //wrap around Earth to nearest point
      tmpX = this.x
      if (tmpX < 0) {
        tmpX += this.mapWidth
      }

      //draw
      context.save()
      context.lineWidth = this.lineWidth
      context.strokeStyle = this.color
      context.fillStyle = this.color
      context.beginPath()
      context.arc(tmpX, this.y, 2.3, 0, 2 * Math.PI, false)
      context.fill()
      context.stroke()

      if (this.launchAnim == false && this.lt <= 1.0 && this.noAnim == false) {
        if (this.lt == 0) {
          this.animCountry = true
        }

        //wrap around Earth to nearest point
        tmpX = this.x1
        if (tmpX < 0) {
          tmpX += this.mapWidth
        }

        context.beginPath()
        context.strokeStyle = "white"
        context.fillStyle = "white"
        context.arc(tmpX, this.y1, 2.3 + 8 * this.lt, 0, 2 * Math.PI, false)
        context.stroke()

        this.lt += this.ltInc
      }

      context.restore()

      //move for next frame
      this.t += this.tInc
      if (this.t > splashSourceSize) {
        if (this.launchAnim == false && this.noAnim == false) {
          this.mode = "hit"
        } else {
          this.active = false
        }
      }
    } else if (this.mode == "hit") {
      //wrap around Earth to nearest point
      tmpX = this.x2
      if (tmpX < 0) {
        tmpX += this.mapWidth
      }

      //draw
      context.save()
      context.lineWidth = 2
      context.strokeStyle = this.color
      context.beginPath()
      context.arc(tmpX, this.y2, 2.3 + 8 * this.lt, 0, 2 * Math.PI, false)
      context.stroke()

      context.beginPath()
      context.arc(tmpX, this.y2, 2.3 + 8 * this.lt, 0, 2 * Math.PI, false)
      context.stroke()

      this.lt += this.ltInc
      if (this.lt > splashDestSize) {
        this.active = false
      }
    }
  }
}
