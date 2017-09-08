class Scanner {
    constructor(x, y, isDevice, dragmove, ref) {
        this.x = x
        this.y = y
        this.dragmove = dragmove
        this.isDevice = isDevice
        this.ref = ref
        this.dbtext = '0db'
        this.error = this.roundDown(Math.random() * 10 - 5, 1) //-1 ..1
        this.box = new Konva.Circle({
            x: x,
            y: y,
            width: 50,
            height: 50,
            radius: 20,
            fill: isDevice?'#00D200':'#00D2FF',
            stroke: 'black',
            strokeWidth: 4,
            draggable: true
        });

        this.text = new Konva.Text({
            x: x - 20,
            y: y + 25,
            text: `x:${x}, y:${y}`,
            fontSize: 18,
            fontFamily: 'Calibri',
            fill: 'green'
        });

        this.db = new Konva.Text({
            x: x-15,
            y: y-40,
            text: `${this.dbtext}`,
            fontSize: 18,
            fontFamily: 'Calibri',
            fill: 'red'
        });

        this.box.on('mouseover', function() {
            document.body.style.cursor = 'pointer';
        })
        this.box.on('mouseout', function() {
            document.body.style.cursor = 'default';
        })
        var self = this
        this.box.on('dragmove', function(evt) {
            self.x = evt.target.attrs.x 
            self.y = evt.target.attrs.y
            self.text.text(`x:${evt.target.attrs.x}, y:${evt.target.attrs.y}`)
            self.text.x(evt.target.attrs.x - 20)
            self.text.y(evt.target.attrs.y + 25)

            self.db.text(this.dbtext)
            self.db.x(evt.target.attrs.x - 15)
            self.db.y(evt.target.attrs.y - 40)

            if(self.dragmove) {
                self.dragmove(evt, self.ref)
            }
        })
    }

    insert(layer) {
        layer.add(this.box);
        layer.add(this.text);
        layer.add(this.db);
    }
    
    roundDown(number, decimals) {
        decimals = decimals || 0
        return (Math.floor(number * Math.pow(10, decimals)) / Math.pow(10, decimals))
    }
    update(db) {

        this.dbtext = this.roundDown(db, 3) + 'db, ' + this.error + '%'
        this.db.text(this.dbtext)
    }
    setText(txt) {

        this.dbtext = txt
        this.db.text(this.dbtext)
    }
    distanceTo(x, y) {
        var x_dis = x - this.x
        var y_dis = y - this.y
        var dis = Math.sqrt(x_dis*x_dis + y_dis*y_dis)
        dis += (this.error/100)*dis
        return dis
        // this.error
    }
    getCalibratePoint(scanners) {
        var dbs = []
        for(var i=0; i<scanners.length; i++) {
            var dis = this.distanceTo(scanners[i].x, scanners[i].y)
            var db = -Math.log(dis)
            dbs.push(db)
        }
        return {x: this.x, y: this.y, dbs: dbs}
    }
}

class Calibrate {
    constructor(x, y, device, scanners) {
        this.x = x
        this.y = y
        this.calPoint = []
        this.text = []
        this.layer = null
        this.device = device
        this.scanners = scanners
        this.addBtn = new Konva.Rect({
            x: x,
            y: y,
            width: 60,
            height: 30,
            radius: 10,
            fill: '#00A21F',
            stroke: 'black',
            strokeWidth: 2,
            draggable: false
        });

        this.addText = new Konva.Text({
            x: x + 5,
            y: y - 20,
            text: `ADD`,
            fontSize: 18,
            fontFamily: 'Calibri',
            fill: 'Black'
        });

        this.clearBtn = new Konva.Rect({
            x: x + 70,
            y: y,
            width: 60,
            height: 30,
            radius: 10,
            fill: '#FF0000',
            stroke: 'black',
            strokeWidth: 2,
            draggable: false
        });

        this.clearText = new Konva.Text({
            x: x + 75,
            y: y - 20,
            text: `CLEAR`,
            fontSize: 18,
            fontFamily: 'Calibri',
            fill: 'Black'
        });

        this.calibrateTxt = new Konva.Text({
            x: x,
            y: y - 50,
            text: `CALIBRATE POINT`,
            fontSize: 18,
            fontFamily: 'Calibri',
            fill: 'Black'
        });

        this.clearBtn.on('mouseover', function() {
            document.body.style.cursor = 'pointer';
        })
        this.clearBtn.on('mouseout', function() {
            document.body.style.cursor = 'default';
        })

        this.addBtn.on('mouseover', function() {
            document.body.style.cursor = 'pointer';
        })
        this.addBtn.on('mouseout', function() {
            document.body.style.cursor = 'default';
        })
        var self = this
        this.addBtn.on('click', function(evt) {
            self.calPoint.push(self.device.getCalibratePoint(self.scanners))
            // console.log(self.device.getCalibratePoint(self.scanners))
            self.render(self)
            // console.log(self.device.x, self.device.y)
        })

        this.clearBtn.on('click', function(evt) {
            self.calPoint = []
            self.render(self)
        })
        
    }
    insert(layer) {
        this.layer = layer
        layer.add(this.addBtn);
        layer.add(this.addText);
        layer.add(this.clearBtn);
        layer.add(this.clearText);
        layer.add(this.calibrateTxt);
    }
    render(self) {
       
        for(var i=0; i<self.text.length; i++) {
            self.text[i].destroy()
        }
        self.text = []
        for(var i=0; i<self.calPoint.length; i++) {
            var txt = new Konva.Text({
                x: self.x,
                y: self.y + i *20 + 40,
                text: `[${i}]. x=${self.calPoint[i].x}, y=${self.calPoint[i].y}`,
                fontSize: 18,
                fontFamily: 'Calibri',
                fill: 'red'
            });
            self.text.push(txt)
            self.layer.add(txt)
        }
        self.layer.draw()
    }
    getCalibratePoint() {
        return this.calPoint
    }
}

class Room {
    constructor(no_scanner, col, layer) {
      this.scanners = []
      
      var x = 200, y = 100, space = 200
      for(var i=0; i<no_scanner; i++) {
        var s = new Scanner(x, y, false, this.scannerMove, this);
        s.insert(layer)
        x += space;
        if(x > space*col) {
            x = 200
            y += space
        }
        this.scanners.push(s)
      }
      this.deviceMove.bind(this)
      this.device = new Scanner(100, 300, true, this.deviceMove, this)
      this.device.insert(layer)
      this.calibrate = new Calibrate(200 + space * col, 100, this.device, this.scanners)
      this.calibrate.insert(layer)
    }

    deviceMove(evt, self) {
        var dbs = []
        for(var i=0; i<self.scanners.length; i++) {
            var dis = self.device.distanceTo(self.scanners[i].x, self.scanners[i].y)
            var db = -Math.log(dis)
            dbs.push(db)
            self.scanners[i].update(db)
        }
        var text = eval(document.getElementById('code').value + ';calculate(dbs, self.calibrate.getCalibratePoint())')
        self.device.setText(text)
    }

    scannerMove(evt) {

    }
}
var width = 1600;
var height = 600;
var stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height
});
var layer = new Konva.Layer();
var rectX = stage.getWidth() / 2 - 50;
var rectY = stage.getHeight() / 2 - 25;

var room = new Room(9, 3, layer)

stage.add(layer);