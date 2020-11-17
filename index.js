const canvas = document.querySelector('canvas')
const score = document.querySelector('#screen-score')
const scorecardScore = document.querySelector('#score-card-score')
const card = document.querySelector("#card")
const c = canvas.getContext('2d')

canvas.width = innerWidth
canvas.height = innerHeight

class Player{
    constructor(x, y, radius, color){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
    }

    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }
}

class Projectile{
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Enemy{
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
    }
    draw(){
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
    }

    update(){
        this.draw()
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
    }
}

class Particle{
    constructor(x, y, radius, color, velocity){
        this.x = x
        this.y = y
        this.radius = radius
        this.color = color
        this.velocity = velocity
        this.alpha = 1
        this.friction = 0.97
    }
    draw(){
        c.save()
        c.globalAlpha = this.alpha
        c.beginPath()
        c.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false)
        c.fillStyle = this.color
        c.fill()
        c.restore()
    }

    update(){
        this.draw()
        this.velocity.x *= this.friction
        this.velocity.y *= this.friction
        this.x = this.x + this.velocity.x
        this.y = this.y + this.velocity.y
        this.alpha -= 0.01
    }
}

const x = canvas.width/2
const y = canvas.height/2

const player = new Player(x, y, 12, 'white')
player.draw()

const projectiles = []
const enemies = []
const particles = []

let  animationId
function animate(){
    animationId = requestAnimationFrame(animate)
    c.fillStyle = 'rgba(0, 0, 0, 0.1)'
    c.fillRect(0, 0, canvas.width, canvas.height)
    player.draw()
    particles.forEach((particle,i)=>{
        if(particle.alpha<=0) particles.splice(i,1)
        else particle.update()
    })
    projectiles.forEach((projectile,index)=>{
        projectile.update()
        if(projectile.x + projectile.radius < 0 ||
            projectile.x - projectile.radius > canvas.width ||
            projectile.y + projectile.radius < 0 ||
            projectile.y - projectile.radius > canvas.height
            ){
            setTimeout(()=>{
                projectiles.slice(index,1)
            },0)
        }
    })

    enemies.forEach((enemy,enIndex)=>{
        enemy.update()

        const dist = Math.hypot(player.x - enemy.x,player.y - enemy.y)
        if(dist - enemy.radius - player.radius < -3){
            card.style.display = "block"
            scorecardScore.innerText = score.innerText
            cancelAnimationFrame(animationId)
        }
        projectiles.forEach((projectile,proIndex)=>{
            const dist = Math.hypot(projectile.x - enemy.x,projectile.y - enemy.y)
            if(dist < projectile.radius + enemy.radius){
                score.innerText = 100 + parseInt(score.innerText)
                for(let i = 0;i< enemy.radius * 2;i++){
                    particles.push(
                        new Particle(
                            projectile.x,
                            projectile.y,
                            Math.random() * 3, 
                            enemy.color, 
                            {
                                x: (Math.random() - 0.5) * enemy.velocity.x*4, 
                                y: (Math.random() - 0.5) * enemy.velocity.y*4   
                            }))
                }
                if(enemy.radius > 20){
                    gsap.to(enemy,{
                        radius: enemy.radius - 10
                    })
                    setTimeout(()=>{
                        projectiles.splice(proIndex, 1)
                    },0)
                }else{
                    setTimeout(()=>{
                        enemies.splice(enIndex, 1)
                        projectiles.splice(proIndex, 1)
                    },0)
                }
            }
        })
    })
}

function spawnEnemies(){
    setInterval(()=>{
        const radius = Math.random() * 20 + 10
        let enX
        let enY
        if(Math.random() < 0.5){
            enX = Math.random() < 0.5 ? 0 - radius : canvas.width + radius
            enY = Math.random() * canvas.height
        }else{
            enX = Math.random() * canvas.width
            enY = Math.random() < 0.5 ? 0 - radius : canvas.height + radius
        }

        const color = `hsl( ${Math.random()*360}, 50%, 50%)`
        let velocity = {
            x: 1,
            y: 1
        }
        const angle = Math.atan2(-enY + canvas.height/2,-enX + canvas.width/2)
        const velocityCoff = 3
        velocity = {
            x: Math.cos(angle) * velocityCoff,
            y: Math.sin(angle) * velocityCoff
        }
        enemies.push(new Enemy(enX, enY, radius, color, velocity))
    }, 1000)
}

window.addEventListener('click',(e)=>{
    const angle = Math.atan2(e.clientY - y,e.clientX - x)
    const velocityCoff = 5
    const velocity = {
        x: Math.cos(angle) * velocityCoff,
        y: Math.sin(angle) * velocityCoff
    }
    const projectile = new Projectile(
        x,
        y, 
        5, 
        'white', 
        velocity
    )
    // console.log(Math.atan2(e.clientX-projectile.x,e.clientY-projectile.y)/Math.PI * 180)
    projectiles.push(projectile)
})

animate()
spawnEnemies()