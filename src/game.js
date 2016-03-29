/**
 * TODO: Calculate speed with delta time.. (forgot how during train today) :-/
 * TODO: The thickness of the ball is not yet taken in account
 *
 * This time a fully other approach.
 * No classes, just simple from top to bottom code.
 * Not a single loop used.
 * I dislike arrow functions, so none of those.
 * Also not a single semicolon.
 * Did not think to much about memory usage this time, because who cares?
 */
(function () {

    'use strict'

    const canvas = document.getElementById('gamecanvas')
    const ctx = canvas.getContext('2d')

    let win = false

    // Used http://paletton.com/#uid=7000u0kw0w0jyC+oRxVy4oIDfjr to choose colors
    // So much choice of pretty colors :)
    const colors = [
        '#FFFF00', // yellow
        '#9FEE00', // green
        '#CD0074', // pink
        '#7109AA', // purple
        '#3914AF', // blue
        '#FFAA00', // orange
        '#009999' // cyan
    ]

    let score = 0
    const scoreColor = '#EEEEEE'

    const ballRadius = 10
    let ballX = canvas.width / 2
    let ballY = canvas.height - 30
    const ballColor = randomColor()

    // The speed of the ball in px per second
    let speedX = 200
    let speedY = -200

    const paddleHeight = 10
    const paddleWidth = 75
    let paddleX = (canvas.width - paddleWidth) / 2
    const paddleColor = randomColor()
    // px per second
    const paddleSpeed = 360

    // This number 25 sucks.. but I need it for detecting, if game is done
    const amountBricks = 25
    const brickWidth = 40
    const brickHeight = 20
    const brickPadding = 10
    const brickOffsetTop = 40
    const brickOffsetLeft = 40

    // Yuck!! This is ugly, but I prefer `map` over `for`
    let bricks = ['', '', '', '', ''].map(function () { // columns
        return ['', '', '', '', ''].map(function () { // row per column
            return {
                x: 0,
                y: 0,
                alive: true,
                color: randomColor()
            }
        })
    })

    let oldTimeSinceStart
    let rightPressed = false
    let leftPressed = false

    document.addEventListener('mousemove', mouseMoveHandler, false)
    document.addEventListener('keydown', keyDownHandler, false)
    document.addEventListener('keyup', keyUpHandler, false)

    function mouseMoveHandler(e) {
        paddleX = e.clientX - (paddleWidth / 2);
    }

    function keyDownHandler(e) {
        if (e.keyCode === 37) {
            leftPressed = true
        }
        if (e.keyCode === 39) {
            rightPressed = true
        }
    }

    // hmmm a bit repeated code here.. :-/
    function keyUpHandler(e) {
        if (e.keyCode === 37) {
            leftPressed = false
        }
        if (e.keyCode === 39) {
            rightPressed = false
        }
    }

    // Random is not really random, but just one of those from the colors array
    function randomColor() {
        return colors[Math.floor(Math.random() * colors.length)]
    }

    // Detect if a brick is hit.. this has neither for the paddle nor the borders
    function collisionDetection () {
        bricks.forEach(function (brickColumn) {
            brickColumn.forEach(function (b) {
                if (!b.alive) {
                    return
                }
                if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                    speedY = -speedY
                    speedX *= 1.03
                    speedY *= 1.03
                    b.alive = false
                    score++
                    if (score === amountBricks) {
                        win = true
                    }
                }
            })
        })
    }

    // Them sweet draw functions. yayh

    function drawWin() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.font = '50px monospace'
        ctx.fillStyle = 'green'
        ctx.fillText('YOU WIN!', 40, canvas.height / 2)
    }

    function drawGameOver() {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        ctx.font = '50px monospace'
        ctx.fillStyle = 'red'
        ctx.fillText('GAME OVER', 30, canvas.height / 2)
    }

    function drawScore() {
        ctx.font = '20px monospace'
        ctx.fillStyle = scoreColor
        ctx.fillText(score, 8, 20)
    }

    function drawBricks() {
        bricks.forEach(function (brickColumn, col) {
            brickColumn.forEach(function (b, row) {
                if (!b.alive) {
                    return
                }
                let brickX = (col * (brickWidth + brickPadding) + brickOffsetLeft)
                let brickY = (row * (brickHeight + brickPadding) + brickOffsetTop)
                b.x = brickX
                b.y = brickY
                ctx.beginPath()
                ctx.rect(brickX, brickY, brickWidth, brickHeight)
                ctx.fillStyle = b.color
                ctx.fill()
                ctx.closePath()
            })
        })
    }

    function drawBall() {
        ctx.beginPath()
        ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2)
        ctx.fillStyle = ballColor
        ctx.fill()
        ctx.closePath()
    }

    function drawPaddle() {
        ctx.beginPath()
        ctx.rect(paddleX, canvas.height - paddleHeight, paddleWidth, paddleHeight)
        ctx.fillStyle = paddleColor
        ctx.fill()
        ctx.closePath()
    }

    // draw is actually the full game logic loop
    function draw(deltaTime) {
        if (win === true) {
            drawWin()
            // simple stopping app, because no more requestAnimationFrame is called
            return
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height)

        // draw stuff
        drawScore()
        drawBricks()
        drawBall()
        drawPaddle()

        // detect if bricks are hit
        collisionDetection()

        // detect if left or right border is hit
        if (ballX > canvas.width - ballRadius || ballX < ballRadius) {
            speedX = -speedX
        }

        // detect if top is hit
        if (ballY < ballRadius) {
            speedY = -speedY
        }

        // detect if bottom is hit
        if (ballY > canvas.height - ballRadius) {
            // touch paddle
            if (ballX > paddleX - 10 && ballX < paddleX + paddleWidth + 10) {
                speedY = -speedY
                /**
                 * Depending on where the ball hits the paddle,
                 * the ball can be directed.
                 *
                 * Strength of the effect.. don't like this yet..:
                 *  300
                 * Center of paddle:
                 *  paddleX + (paddleWidth / 2)
                 * The difference from the center:
                 *  "Center of paddle" - ballX
                 * The ratio of how precise the center is hit:
                 *  "The difference from the center" / (paddleWidth / 2)
                 */
                speedX = -(300 * ((paddleX + (paddleWidth / 2) - ballX) / (paddleWidth / 2)))
            } else {
                drawGameOver()
                // simple stopping app, because no more requestAnimationFrame is called
                return
            }
        }

        ballX += (speedX * deltaTime)
        ballY += (speedY * deltaTime)

        if (rightPressed && paddleX < canvas.width - paddleWidth) {
            paddleX += paddleSpeed * deltaTime
        } else if (leftPressed && paddleX > 0) {
            paddleX -= paddleSpeed * deltaTime
        }

    }

    function gameLoop() {
        let newTimeSinceStart = performance.now()
        let deltaTime = newTimeSinceStart - oldTimeSinceStart

        // contains the game logic
        draw(deltaTime / 1000)

        oldTimeSinceStart = newTimeSinceStart
        requestAnimationFrame(gameLoop)
    }

    oldTimeSinceStart = performance.now()
    requestAnimationFrame(gameLoop)

}())
