// Mobile menu toggle
const burger = document.getElementById('burgerBtn');
const menu = document.getElementById('mobileMenu');
const closeBtn = document.getElementById('closeMenu');
burger.addEventListener('click', () => menu.classList.add('open'));
closeBtn.addEventListener('click', () => menu.classList.remove('open'));
menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('open')));

// Show/hide the desktop "Free Counselling" CTA based on viewport width
function showDeskCta(){
  const cta = document.getElementById('deskCta');
  cta.style.display = window.innerWidth > 960 ? 'inline-flex' : 'none';
}
showDeskCta();
window.addEventListener('resize', showDeskCta);

// ===== Global plane: smooth flight, gently banks between headings, wraps around any edge =====
(function(){
  const plane = document.querySelector('.global-plane');
  if(!plane) return;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if(reduceMotion){ plane.style.display = 'none'; return; }

  let x = -80;
  let y = window.innerHeight * 0.55;
  let angle = 20;        // current heading in degrees; 0 = pointing right
  let targetAngle = 20;  // heading the plane is gradually banking toward
  const speed = 120;         // px per second, forward flight speed
  const turnRate = 28;       // max degrees per second while banking (higher = tighter turns)
  let lastTurn = performance.now();
  let turnInterval = 3000 + Math.random() * 3000;
  let lastFrame = null;

  function angleDiff(a, b){
    // shortest signed distance from angle a to angle b, in range -180..180
    return ((b - a + 540) % 360) - 180;
  }

  function step(now){
    if(lastFrame === null) lastFrame = now;
    const dt = Math.min((now - lastFrame) / 1000, 0.05);
    lastFrame = now;

    // periodically pick a new gentle heading to drift toward
    if(now - lastTurn > turnInterval){
      targetAngle = angle + (Math.random() * 130 - 65);
      lastTurn = now;
      turnInterval = 2600 + Math.random() * 3400;
    }

    // smoothly bank the current heading toward the target, like a real plane turning
    const diff = angleDiff(angle, targetAngle);
    const maxStep = turnRate * dt;
    if(Math.abs(diff) <= maxStep){
      angle = targetAngle;
    } else {
      angle += Math.sign(diff) * maxStep;
    }

    const rad = angle * Math.PI / 180;
    x += Math.cos(rad) * speed * dt;
    y += Math.sin(rad) * speed * dt;

    // wrap around any edge of the viewport
    const margin = 90;
    const w = window.innerWidth;
    const h = window.innerHeight;
    if(x > w + margin) x = -margin;
    if(x < -margin) x = w + margin;
    if(y > h + margin) y = -margin;
    if(y < -margin) y = h + margin;

    plane.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
    requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
})();