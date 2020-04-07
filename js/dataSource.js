function DataSource(name, x, y, color) {
  //set default values if undefined
  if (name === undefined) {
    name = 0
  }
  if (x === undefined) {
    x = 0
  }
  if (y === undefined) {
    y = 0
  }
  if (color === undefined) {
    color = "#fff"
  }

  //data source name
  this.name = name

  //data source position
  this.x = x
  this.y = y

  //color
  this.color = color

  //time percentage, used to manage "ping ring" animation
  this.t = 0
  this.tInc = 0.005

  //other settings
  this.lineWidth = 1
  this.radius = 2
  this.scale = 1.0
  this.ringOurterRadius = 30
}

DataSource.prototype.draw = function (context) {
  //draw
  context.save()

  //main point
  context.lineWidth = this.lineWidth
  context.strokeStyle = this.color
  context.fillStyle = this.color
  context.beginPath()
  context.arc(this.x, this.y, 2.3, 0, 2 * Math.PI, false)
  context.fill()
  context.stroke()

  //ping ring
  context.strokeStyle = "rgba(255, 255, 255, " + (1 - this.t) + ")"
  context.lineWidth = 2
  context.beginPath()
  context.arc(
    this.x,
    this.y,
    2.3 + this.ringOurterRadius * this.t,
    0,
    2 * Math.PI,
    false,
  )
  context.stroke()

  //text shadow
  context.font = "12px Helvetica"
  context.fillStyle = "rgba(0, 54, 74, 1.0)"
  context.fillText(this.name, this.x + 12, this.y + 6)

  //text
  context.fillStyle = "rgba(255, 255, 255, 1.0)"
  context.fillText(this.name, this.x + 10, this.y + 4)

  context.restore()

  this.t -= this.tInc
  if (this.t < 0) {
    this.t = 1.0
  }
}
