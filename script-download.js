// 下载和导出模块

// 下载图片
function downloadImage() {
    if (images.length === 0) {
        alert('请先上传图片');
        return;
    }

    if (currentMode === 'layout' && !currentLayout) {
        alert('请先选择布局模板');
        return;
    }

    // 打开保存对话框
    const saveDialog = document.getElementById('saveDialog');
    saveDialog.style.display = 'block';
    document.getElementById('fileName').value = '拼图结果';
    updateEstimatedSize();
}

// 初始化保存对话框
function initSaveDialog() {
    // 保存对话框相关元素
    const saveDialog = document.getElementById('saveDialog');
    const closeModal = document.querySelector('.close-modal');
    const saveBtn = document.getElementById('saveBtn');
    const saveAsBtn = document.getElementById('saveAsBtn');
    const pathBtns = document.querySelectorAll('.path-btn');
    const currentPath = document.getElementById('currentPath');
    const changePathBtn = document.getElementById('changePathBtn');
    const fileNameInput = document.getElementById('fileName');
    const qualityTabs = document.querySelectorAll('.quality-tab');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');

    // 关闭保存对话框
    closeModal.addEventListener('click', function() {
        saveDialog.style.display = 'none';
    });

    // 点击对话框外部关闭
    window.addEventListener('click', function(event) {
        if (event.target === saveDialog) {
            saveDialog.style.display = 'none';
        }
    });

    // 选择保存路径
    pathBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            pathBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');

            let path;
            switch(this.dataset.path) {
                case 'desktop':
                    path = 'C:\\Users\\Administrator\\Desktop';
                    break;
                case 'documents':
                    path = 'C:\\Users\\Administrator\\Documents';
                    break;
                case 'downloads':
                    path = 'C:\\Users\\Administrator\\Downloads';
                    break;
                default:
                    path = 'C:\\Users\\Administrator\\Desktop';
            }
            currentPath.textContent = path;
        });
    });

    // 更改路径按钮
    changePathBtn.addEventListener('click', function() {
        alert('此功能在浏览器中受限，实际应用可能需要后端支持');
    });

    // 选择画质调整模式
    qualityTabs.forEach(tab => {
        tab.addEventListener('click', function() {
            qualityTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            // 根据选择的模式调整滑块行为
            if (this.dataset.qualityMode === 'manual') {
                qualitySlider.disabled = false;
            } else {
                qualitySlider.disabled = true;
                // 智能压缩和AI变清晰模式可以设置默认值
                if (this.dataset.qualityMode === 'auto') {
                    qualitySlider.value = 80;
                } else {
                    qualitySlider.value = 95;
                }
                qualityValue.textContent = qualitySlider.value;
                updateEstimatedSize();
            }
        });
    });

    // 画质滑块调整
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = this.value;
        updateEstimatedSize();
    });

    // 保存按钮
    saveBtn.addEventListener('click', function() {
        saveImage();
        saveDialog.style.display = 'none';
    });

    // 另存为按钮
    saveAsBtn.addEventListener('click', function() {
        saveImage();
        saveDialog.style.display = 'none';
    });
}

// 保存图片
function saveImage() {
    // 创建canvas
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // 计算canvas尺寸
    let width, height;
    const gap = parseInt(elements.gapInput.value) || 0;

    // 获取高级设置值
    const bgColor = document.getElementById('bgColor').value;
    const saveFormat = document.getElementById('saveFormat').value;
    const quality = parseInt(document.getElementById('qualitySlider').value) / 100;
    const watermarkText = document.getElementById('watermarkText').value;
    const watermarkColor = document.getElementById('watermarkColor').value;
    const watermarkOpacity = parseFloat(document.getElementById('watermarkOpacity').value);
    const watermarkPosition = document.getElementById('watermarkPosition').value;

    if (currentMode === 'layout') {
        // 根据当前布局计算尺寸
        switch (currentLayout) {
            case '2h':
                width = 150 * 2 + gap;
                height = 150;
                break;
            case '2v':
                width = 150;
                height = 150 * 2 + gap;
                break;
            case '3h':
                width = 100 * 3 + gap * 2;
                height = 100;
                break;
            case '3v':
                width = 100;
                height = 100 * 3 + gap * 2;
                break;
            case '3m':
                width = 310;
                height = 150 * 2 + gap;
                break;
            case '4h':
                width = 75 * 4 + gap * 3;
                height = 75;
                break;
            case '4v':
                width = 75;
                height = 75 * 4 + gap * 3;
                break;
            case '4g':
                width = 150 * 2 + gap;
                height = 150 * 2 + gap;
                break;
            case '4m':
                width = 230 + 70 + gap;
                height = 310;
                break;
            case '5m':
                width = 310;
                height = 120 + 180 + gap;
                break;
            default:
                width = 400;
                height = 300;
        }
    } else {
        // 拼图模式
        const itemCount = images.length;
        if (currentOrientation === 'horizontal') {
            const itemWidth = Math.min(200, 800 / itemCount);
            width = itemWidth * itemCount + gap * (itemCount - 1);
            height = 200;
        } else {
            const itemHeight = Math.min(200, 800 / itemCount);
            width = 200;
            height = itemHeight * itemCount + gap * (itemCount - 1);
        }
    }

    // 确保canvas尺寸不为0
    width = Math.max(width, 100);
    height = Math.max(height, 100);
    canvas.width = width;
    canvas.height = height;

    console.log('Canvas尺寸:', width, 'x', height);

    // 绘制背景
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, width, height);

    // 创建一个Promise数组来处理所有图片加载
    const imagePromises = [];

    if (currentMode === 'layout') {
        let x = 0;
        let y = 0;
        const itemCount = Math.min(images.length, getLayoutItemCount(currentLayout));

        for (let i = 0; i < itemCount; i++) {
            let itemWidth, itemHeight, nextX, nextY;

            // 根据布局设置尺寸
            switch (currentLayout) {
                case '2h':
                    itemWidth = 150;
                    itemHeight = 150;
                    nextX = x + itemWidth + gap;
                    nextY = y;
                    break;
                case '2v':
                    itemWidth = 150;
                    itemHeight = 150;
                    nextX = x;
                    nextY = y + itemHeight + gap;
                    break;
                case '3h':
                    itemWidth = 100;
                    itemHeight = 100;
                    nextX = x + itemWidth + gap;
                    nextY = y;
                    break;
                case '3v':
                    itemWidth = 100;
                    itemHeight = 100;
                    nextX = x;
                    nextY = y + itemHeight + gap;
                    break;
                case '3m':
                    if (i === 0) {
                        itemWidth = 310;
                        itemHeight = 150;
                        nextX = x;
                        nextY = y + itemHeight + gap;
                    } else if (i === 1) {
                        itemWidth = 150;
                        itemHeight = 150;
                        nextX = x + itemWidth + gap;
                        nextY = y;
                    } else {
                        itemWidth = 150;
                        itemHeight = 150;
                        nextX = x;
                        nextY = y;
                    }
                    break;
                case '4h':
                    itemWidth = 75;
                    itemHeight = 75;
                    nextX = x + itemWidth + gap;
                    nextY = y;
                    break;
                case '4v':
                    itemWidth = 75;
                    itemHeight = 75;
                    nextX = x;
                    nextY = y + itemHeight + gap;
                    break;
                case '4g':
                    if (i === 0 || i === 1) {
                        itemWidth = 150;
                        itemHeight = 150;
                        nextX = x + itemWidth + gap;
                        nextY = y;
                    } else {
                        itemWidth = 150;
                        itemHeight = 150;
                        nextX = x + itemWidth + gap;
                        nextY = y + itemHeight + gap;
                    }
                    break;
                case '4m':
                    if (i === 0) {
                        itemWidth = 230;
                        itemHeight = 310;
                        nextX = x + itemWidth + gap;
                        nextY = y;
                    } else if (i === 1) {
                        itemWidth = 70;
                        itemHeight = 100;
                        nextX = x;
                        nextY = y + itemHeight + gap;
                    } else if (i === 2) {
                        itemWidth = 70;
                        itemHeight = 100;
                        nextX = x;
                        nextY = y + itemHeight + gap;
                    } else {
                        itemWidth = 70;
                        itemHeight = 100;
                        nextX = x;
                        nextY = y + itemHeight + gap;
                    }
                    break;
                case '5m':
                    if (i === 0) {
                        itemWidth = 310;
                        itemHeight = 120;
                        nextX = x;
                        nextY = y + itemHeight + gap;
                    } else if (i === 1) {
                        itemWidth = 70;
                        itemHeight = 180;
                        nextX = x + itemWidth + gap;
                        nextY = y;
                    } else if (i === 2) {
                        itemWidth = 70;
                        itemHeight = 180;
                        nextX = x + itemWidth + gap;
                        nextY = y;
                    } else if (i === 3) {
                        itemWidth = 70;
                        itemHeight = 180;
                        nextX = x + itemWidth + gap;
                        nextY = y;
                    } else {
                        itemWidth = 70;
                        itemHeight = 180;
                        nextX = x;
                        nextY = y;
                    }
                    break;
                default:
                    itemWidth = 100;
                    itemHeight = 100;
                    nextX = x + itemWidth + gap;
                    nextY = y;
            }

            // 创建图片加载Promise
            const promise = new Promise((resolve, reject) => {
                const img = new Image();
                // 修复图片跨域问题
                img.crossOrigin = 'anonymous';
                img.src = images[i];
                img.onload = function() {
                    // 绘制图片
                    ctx.drawImage(img, x, y, itemWidth, itemHeight);
                    
                    // 更新位置
                    x = nextX;
                    y = nextY;
                    resolve();
                };
                img.onerror = function(error) {
                    console.error('图片加载失败:', error, '图片URL:', images[i]);
                    // 绘制一个错误提示
                    ctx.fillStyle = 'red';
                    ctx.fillRect(x, y, itemWidth, itemHeight);
                    ctx.fillStyle = 'white';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('图片加载失败', x + itemWidth/2, y + itemHeight/2);
                    
                    // 更新位置
                    x = nextX;
                    y = nextY;
                    resolve(); // 即使失败也继续
                };
            });
            imagePromises.push(promise);
        }
    } else {
        // 拼图模式
        const itemCount = images.length;
        let x = 0;
        let y = 0;
        
        for (let i = 0; i < itemCount; i++) {
            let itemWidth, itemHeight, nextX, nextY;
            
            if (currentOrientation === 'horizontal') {
                itemWidth = Math.min(200, 800 / itemCount);
                itemHeight = 200;
                nextX = x + itemWidth + gap;
                nextY = y;
            } else {
                itemWidth = 200;
                itemHeight = Math.min(200, 800 / itemCount);
                nextX = x;
                nextY = y + itemHeight + gap;
            }
            
            // 创建图片加载Promise
            const promise = new Promise((resolve, reject) => {
                const img = new Image();
                img.crossOrigin = 'anonymous';
                img.src = images[i];
                img.onload = function() {
                    ctx.drawImage(img, x, y, itemWidth, itemHeight);
                    
                    // 更新位置
                    x = nextX;
                    y = nextY;
                    resolve();
                };
                img.onerror = function(error) {
                    console.error('图片加载失败:', error, '图片URL:', images[i]);
                    ctx.fillStyle = 'red';
                    ctx.fillRect(x, y, itemWidth, itemHeight);
                    ctx.fillStyle = 'white';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('图片加载失败', x + itemWidth/2, y + itemHeight/2);
                    
                    // 更新位置
                    x = nextX;
                    y = nextY;
                    resolve();
                };
            });
            imagePromises.push(promise);
        }
    }

    // 等待所有图片加载并绘制完成
    Promise.all(imagePromises).then(() => {
        // 添加水印
        if (watermarkText) {
            ctx.fillStyle = watermarkColor;
            ctx.globalAlpha = watermarkOpacity;
            ctx.font = '20px Arial';
            
            const textWidth = ctx.measureText(watermarkText).width;
            const textHeight = 20;
            let textX, textY;
            
            switch (watermarkPosition) {
                case 'top-left':
                    textX = 10;
                    textY = 30;
                    break;
                case 'top-right':
                    textX = width - textWidth - 10;
                    textY = 30;
                    break;
                case 'bottom-left':
                    textX = 10;
                    textY = height - 10;
                    break;
                case 'bottom-right':
                    textX = width - textWidth - 10;
                    textY = height - 10;
                    break;
                case 'center':
                    textX = (width - textWidth) / 2;
                    textY = (height + textHeight) / 2;
                    break;
                default:
                    textX = 10;
                    textY = 30;
            }
            
            ctx.fillText(watermarkText, textX, textY);
            ctx.globalAlpha = 1;
        }

        // 创建下载链接
        const link = document.createElement('a');
        if (saveFormat === 'png') {
            link.href = canvas.toDataURL('image/png');
        } else {
            link.href = canvas.toDataURL('image/jpeg', quality);
        }
        
        const fileName = document.getElementById('fileName').value || '拼图结果';
        link.download = `${fileName}.${saveFormat}`;
        
        // 触发下载
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    });
}

// 更新预估大小
function updateEstimatedSize() {
    // 这里是模拟的预估大小计算
    const quality = parseInt(document.getElementById('qualitySlider').value);
    // 假设基础大小为100KB，质量每降低10%，大小减少15%
    const baseSize = 100;
    const sizeReduction = (100 - quality) / 10 * 0.15;
    const estimated = baseSize * (1 - sizeReduction);
    document.getElementById('estimatedSize').textContent = estimated.toFixed(2) + ' KB';
}