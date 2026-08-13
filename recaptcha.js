(function() {
    class CaptchaEngine {
        constructor(canvas, settings) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
            this.settings = settings;
            this.text = '';
            this.startTime = 0;
        }

        render() {
            this.startTime = Date.now();
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            
            const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
            this.text = '';
            if (this.settings.randomChars) {
                for (let i = 0; i < 6; i++) {
                    this.text += chars.charAt(Math.floor(Math.random() * chars.length));
                }
            } else {
                this.text = 'Sample1';
            }

            if (this.settings.noise) this.drawNoise();

            const margin = 20;
            const usableWidth = this.canvas.width - margin * 2;
            const charWidth = usableWidth / 6;
            for (let i = 0; i < 6; i++) {
                const x = margin + i * charWidth + charWidth / 2;
                this.drawCharacter(this.text[i], x, this.canvas.height / 2);
            }

            if (this.settings.noise) this.drawOverlays();
        }

        drawNoise() {
            const w = this.canvas.width;
            const h = this.canvas.height;
            
            for(let i=0; i<10; i++) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(${Math.random()*120}, ${Math.random()*120}, ${Math.random()*120}, ${Math.random()*0.4 + 0.1})`;
                this.ctx.lineWidth = 1;
                this.ctx.moveTo(Math.random()*w, Math.random()*h);
                this.ctx.lineTo(Math.random()*w, Math.random()*h);
                this.ctx.stroke();
            }
            for(let i=0; i<5; i++) {
                this.ctx.beginPath();
                this.ctx.strokeStyle = `rgba(${Math.random()*120}, ${Math.random()*120}, ${Math.random()*120}, ${Math.random()*0.4 + 0.1})`;
                this.ctx.arc(Math.random()*w, Math.random()*h, Math.random()*30, 0, Math.PI*2);
                this.ctx.stroke();
            }
            for(let i=0; i<80; i++) {
                this.ctx.fillStyle = `rgba(${Math.random()*150}, ${Math.random()*150}, ${Math.random()*150}, ${Math.random()*0.5 + 0.1})`;
                this.ctx.fillRect(Math.random()*w, Math.random()*h, 2, 2);
            }
            for(let i=0; i<4; i++) {
                this.ctx.fillStyle = `rgba(${Math.random()*150}, ${Math.random()*150}, ${Math.random()*150}, ${Math.random()*0.3 + 0.1})`;
                this.ctx.beginPath();
                let x = Math.random() * w, y = Math.random() * h;
                this.ctx.moveTo(x, y);
                this.ctx.lineTo(x + Math.random()*25, y + Math.random()*25);
                this.ctx.lineTo(x - Math.random()*25, y + Math.random()*25);
                this.ctx.fill();
            }
        }

        drawCharacter(char, x, y) {
            const offCanvas = document.createElement('canvas');
            offCanvas.width = 45;
            offCanvas.height = 55;
            const offCtx = offCanvas.getContext('2d');
            
            let font = 'Arial';
            if (this.settings.multiFont) {
                const fonts = ['Impact', 'Courier New', 'Comic Sans MS', 'Georgia', 'Times New Roman'];
                font = fonts[Math.floor(Math.random() * fonts.length)];
            }
            offCtx.font = `bold ${26 + Math.random()*8}px ${font}`;
            
            if (this.settings.color) {
                const palette = ['#603A2E', '#773B29', '#903C22', '#AC3B19', '#CA390D', '#E04319', '#F34F31', '#FF5D49', '#FF6C62', '#FF7E7A'];
                offCtx.fillStyle = palette[Math.floor(Math.random() * palette.length)];
            } else {
                offCtx.fillStyle = '#000';
            }
            offCtx.textBaseline = 'middle';
            offCtx.fillText(char, 0, offCanvas.height / 2);

            const distCanvas = document.createElement('canvas');
            distCanvas.width = offCanvas.width;
            distCanvas.height = offCanvas.height;
            const distCtx = distCanvas.getContext('2d');
            
            if (this.settings.distortion) {
                const intensity = this.settings.distortionIntensity || 1;
                const freq = (0.5 + Math.random() * 1.0) * intensity;
                const amp = (1 + Math.random() * 2) * intensity;
                for (let i = 0; i < offCanvas.width; i++) {
                    let waveY = Math.sin((i / offCanvas.width) * Math.PI * 2 * freq) * amp;
                    distCtx.drawImage(offCanvas, i, 0, 1, offCanvas.height, i, waveY, 1, offCanvas.height);
                }
            } else {
                distCtx.drawImage(offCanvas, 0, 0);
            }

            this.ctx.save();
            let drawY = y;
            if (this.settings.randomHeight) {
                drawY += (Math.random() - 0.5) * 20;
            }
            this.ctx.translate(x, drawY);
            
            const intensity = this.settings.distortionIntensity || 1;
            let stretchX = this.settings.distortion ? (1 - 0.05 * intensity + Math.random() * 0.1 * intensity) : 1;
            let stretchY = this.settings.distortion ? (1 - 0.05 * intensity + Math.random() * 0.1 * intensity) : 1;
            this.ctx.scale(stretchX, stretchY);

            let rotation = this.settings.randomRotation ? ((Math.random() - 0.5) * 0.5) : 0; 
            this.ctx.rotate(rotation);

            this.ctx.drawImage(distCanvas, -distCanvas.width / 2, -distCanvas.height / 2);
            this.ctx.restore();
        }

        drawOverlays() {
            const w = this.canvas.width;
            const h = this.canvas.height;
            const charWidth = w / 6;
            
            for (let i = 0; i < 6; i++) {
                let cx = i * charWidth + charWidth/2;
                let cy = h / 2;
                
                let bw = 6 + Math.random() * 10;
                let bh = 8 + Math.random() * 12;
                let bx = cx + (Math.random() - 0.5) * 10;
                let by = cy + (Math.random() - 0.5) * 15;
                
                this.ctx.fillStyle = `rgba(${Math.random()*100}, ${Math.random()*100}, ${Math.random()*100}, 0.35)`;
                this.ctx.fillRect(bx, by, bw, bh);
                
                this.ctx.strokeStyle = `rgba(${Math.random()*150}, ${Math.random()*150}, ${Math.random()*150}, 0.5)`;
                this.ctx.lineWidth = 2 + Math.random() * 2;
                this.ctx.beginPath();
                this.ctx.moveTo(cx - 15, cy + (Math.random()-0.5)*30);
                this.ctx.lineTo(cx + 15, cy + (Math.random()-0.5)*30);
                this.ctx.stroke();
            }
        }

        verify(userInput) {
            const elapsed = Date.now() - this.startTime;
            if (this.settings.antiBot && elapsed < 500) {
                return { success: false, reason: 'Failed Anti-bot timing rule (< 500ms)' };
            }
            if (userInput === this.text) {
                return { success: true };
            }
            return { success: false, reason: 'Incorrect text' };
        }
    }

    function init() {
        const scripts = document.querySelectorAll('script[src*="recaptcha.js"]');
        scripts.forEach(script => {
            const settingsStr = script.getAttribute('data-settings');
            let settings = {};
            try {
                settings = JSON.parse(decodeURIComponent(settingsStr));
            } catch(e) {
                settings = { 
                    randomChars: true, multiFont: true, distortion: true, noise: true, 
                    randomRotation: true, randomHeight: true, color: true, antiBot: true,
                    distortionIntensity: 1.0
                };
            }

            const container = document.createElement('div');
            container.className = 'my-captcha-container';
            container.style.margin = '15px 0';
            container.style.padding = '10px';
            container.style.border = '1px solid #ddd';
            container.style.display = 'inline-block';
            container.style.background = '#fff';
            container.style.borderRadius = '6px';

            const canvas = document.createElement('canvas');
            canvas.width = 320;
            canvas.height = 80;
            canvas.style.border = '1px solid #ccc';
            canvas.style.display = 'block';
            canvas.style.marginBottom = '10px';
            canvas.style.borderRadius = '4px';
            
            const input = document.createElement('input');
            input.type = 'text';
            input.placeholder = 'Type CAPTCHA text';
            input.style.padding = '8px';
            input.style.marginRight = '5px';
            input.style.border = '1px solid #ccc';
            input.style.borderRadius = '4px';

            const refreshBtn = document.createElement('button');
            refreshBtn.innerText = '↻';
            refreshBtn.style.padding = '8px 12px';
            refreshBtn.style.border = '1px solid #ccc';
            refreshBtn.style.borderRadius = '4px';
            refreshBtn.style.cursor = 'pointer';
            refreshBtn.style.background = '#f0f0f0';

            container.appendChild(canvas);
            const ctrlRow = document.createElement('div');
            ctrlRow.appendChild(input);
            ctrlRow.appendChild(refreshBtn);
            container.appendChild(ctrlRow);

            script.parentNode.insertBefore(container, script);

            const captcha = new CaptchaEngine(canvas, settings);
            captcha.render();

            refreshBtn.addEventListener('click', () => {
                captcha.render();
                input.value = '';
            });

            window.validateCaptcha = function(targetContainer) {
                if (container !== targetContainer) return false;
                const userInput = input.value;
                const result = captcha.verify(userInput);
                
                if (result.success) {
                    if (window.onCaptchaSuccess) window.onCaptchaSuccess();
                } else {
                    if (window.onCaptchaFailure) window.onCaptchaFailure(result.reason);
                }
                return result.success;
            };
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
