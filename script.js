document.addEventListener('DOMContentLoaded', function() {
    // 获取DOM元素
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const previewArea = document.getElementById('previewArea');
    const downloadBtn = document.getElementById('downloadBtn');
    const resetBtn = document.getElementById('resetBtn');
    const gapInput = document.getElementById('gap');
    const borderRadiusInput = document.getElementById('borderRadius');
    const borderColorInput = document.getElementById('borderColor');
    const borderWidthInput = document.getElementById('borderWidth');
    const layoutModeBtn = document.getElementById('layoutMode');
    const puzzleModeBtn = document.getElementById('puzzleMode');
    const layoutTemplates = document.getElementById('layoutTemplates');
    const puzzleOrientation = document.getElementById('puzzleOrientation');
    const horizontalBtn = document.getElementById('horizontal');
    const verticalBtn = document.getElementById('vertical');
    const templateItems = document.querySelectorAll('.template');

    // 全局变量
    let images = [];
    let currentMode = 'layout'; // 'layout' 或 'puzzle'
    let currentLayout = null;
    let currentOrientation = 'horizontal';
    let draggedItem = null;
    let isAltPressed = false;
    let startX, startY, offsetX, offsetY;

    // 初始化
    init();

    function init() {
        // 绑定事件
        dropZone.addEventListener('click', () => fileInput.click());
        fileInput.addEventListener('change', handleFileSelect);
        dropZone.addEventListener('dragover', handleDragOver);
        dropZone.addEventListener('drop', handleDrop);
        downloadBtn.addEventListener('click', downloadImage);
        resetBtn.addEventListener('click', resetApp);
        gapInput.addEventListener('input', updatePreview);
        borderRadiusInput.addEventListener('input', updatePreview);
        borderColorInput.addEventListener('input', updatePreview);
        borderWidthInput.addEventListener('input', updatePreview);
        layoutModeBtn.addEventListener('click', () => switchMode('layout'));
        puzzleModeBtn.addEventListener('click', () => switchMode('puzzle'));
        horizontalBtn.addEventListener('click', () => setOrientation('horizontal'));
        verticalBtn.addEventListener('click', () => setOrientation('vertical'));
        templateItems.forEach(template => template.addEventListener('click', selectTemplate));

        // 监听键盘事件
        document.addEventListener('keydown', handleKeyDown);
        document.addEventListener('keyup', handleKeyUp);

        // 高级设置切换
        const toggleAdvancedSettings = document.getElementById('toggleAdvancedSettings');
        const advancedSettings = document.getElementById('advancedSettings');

        toggleAdvancedSettings.addEventListener('click', () => {
            if (advancedSettings.style.display === 'none') {
                advancedSettings.style.display = 'block';
                toggleAdvancedSettings.innerHTML = '<i class="fas fa-cog"></i> 收起高级设置';
            } else {
                advancedSettings.style.display = 'none';
                toggleAdvancedSettings.innerHTML = '<i class="fas fa-cog"></i> 高级设置';
            }
        });

        // 导出质量显示
        const exportQuality = document.getElementById('exportQuality');
        const qualityValue = document.getElementById('qualityValue');

        exportQuality.addEventListener('input', function() {
            const quality = parseFloat(this.value);
            qualityValue.textContent = Math.round(quality * 100) + '%';
        });

        // 初始状态
        updatePreview();
    }

    // 处理文件选择
    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            processFiles(files);
        }
    }

    // 处理拖放
    function handleDragOver(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#3498db';
        dropZone.style.backgroundColor = '#f8f9fa';
    }

    function handleDrop(e) {
        e.preventDefault();
        dropZone.style.borderColor = '#ccc';
        dropZone.style.backgroundColor = 'transparent';

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFiles(files);
        }
    }

    // 处理文件
    function processFiles(files) {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            if (file.type.match('image.*')) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    images.push(e.target.result);
                    updatePreview();
                };
                reader.readAsDataURL(file);
            }
        }
    }

    // 切换模式
    function switchMode(mode) {
        currentMode = mode;

        if (mode === 'layout') {
            layoutModeBtn.classList.add('active');
            puzzleModeBtn.classList.remove('active');
            layoutTemplates.style.display = 'block';
            puzzleOrientation.style.display = 'none';
        } else {
            layoutModeBtn.classList.remove('active');
            puzzleModeBtn.classList.add('active');
            layoutTemplates.style.display = 'none';
            puzzleOrientation.style.display = 'block';
        }

        updatePreview();
    }

    // 设置拼图方向
    function setOrientation(orientation) {
        currentOrientation = orientation;

        if (orientation === 'horizontal') {
            horizontalBtn.classList.add('active');
            verticalBtn.classList.remove('active');
        } else {
            horizontalBtn.classList.remove('active');
            verticalBtn.classList.add('active');
        }

        updatePreview();
    }

    // 选择模板
    function selectTemplate(e) {
        const template = e.currentTarget;
        currentLayout = template.dataset.layout;

        // 更新模板选中状态
        templateItems.forEach(t => t.classList.remove('active'));
        template.classList.add('active');

        updatePreview();
    }

    // 更新预览
    function updatePreview() {
        const gap = parseInt(gapInput.value) || 0;
        const borderRadius = parseInt(borderRadiusInput.value) || 0;
        const borderColor = borderColorInput.value;
        const borderWidth = parseInt(borderWidthInput.value) || 0;

        previewArea.innerHTML = '';

        if (images.length === 0) {
            previewArea.innerHTML = '<p class="placeholder">请上传图片并选择布局模板</p>';
            return;
        }

        if (currentMode === 'layout') {
            if (!currentLayout) {
                previewArea.innerHTML = '<p class="placeholder">请选择布局模板</p>';
                return;
            }

            // 创建布局容器
            const layoutContainer = document.createElement('div');
            layoutContainer.className = 'layout-container';
            layoutContainer.style.gap = `${gap}px`;

            // 根据布局模板创建布局项
            let itemCount = 0;

            switch (currentLayout) {
                case '2h':
                    itemCount = 2;
                    layoutContainer.style.flexDirection = 'row';
                    break;
                case '2v':
                    itemCount = 2;
                    layoutContainer.style.flexDirection = 'column';
                    break;
                case '3h':
                    itemCount = 3;
                    layoutContainer.style.flexDirection = 'row';
                    break;
                case '3v':
                    itemCount = 3;
                    layoutContainer.style.flexDirection = 'column';
                    break;
                case '3m':
                    itemCount = 3;
                    break;
                case '4h':
                    itemCount = 4;
                    layoutContainer.style.flexDirection = 'row';
                    break;
                case '4v':
                    itemCount = 4;
                    layoutContainer.style.flexDirection = 'column';
                    break;
                case '4g':
                    itemCount = 4;
                    layoutContainer.style.flexWrap = 'wrap';
                    break;
                case '4m':
                    itemCount = 4;
                    break;
                case '5m':
                    itemCount = 5;
                    break;
            }

            // 限制最大项目数为图片数量
            itemCount = Math.min(itemCount, images.length);

            // 创建布局项
            for (let i = 0; i < itemCount; i++) {
                const layoutItem = document.createElement('div');
                layoutItem.className = 'layout-item';
                layoutItem.style.backgroundImage = `url(${images[i]})`;
                layoutItem.style.borderRadius = `${borderRadius}px`;
                layoutItem.style.border = `${borderWidth}px solid ${borderColor}`;
                layoutItem.dataset.index = i;

                // 根据不同布局设置样式
                switch (currentLayout) {
                    case '2h':
                    case '2v':
                        layoutItem.style.width = '150px';
                        layoutItem.style.height = '150px';
                        break;
                    case '3h':
                    case '3v':
                        layoutItem.style.width = '100px';
                        layoutItem.style.height = '100px';
                        break;
                    case '3m':
                        if (i === 0) {
                            layoutItem.style.width = '310px';
                            layoutItem.style.height = '150px';
                            layoutItem.style.marginBottom = `${gap}px`;
                        } else {
                            layoutItem.style.width = '150px';
                            layoutItem.style.height = '150px';
                        }
                        break;
                    case '4h':
                    case '4v':
                        layoutItem.style.width = '75px';
                        layoutItem.style.height = '75px';
                        break;
                    case '4g':
                        layoutItem.style.width = '150px';
                        layoutItem.style.height = '150px';
                        break;
                    case '4m':
                        if (i === 0) {
                            layoutItem.style.width = '230px';
                            layoutItem.style.height = '310px';
                            layoutItem.style.marginRight = `${gap}px`;
                        } else {
                            layoutItem.style.width = '70px';
                            layoutItem.style.height = '100px';
                        }
                        break;
                    case '5m':
                        if (i === 0) {
                            layoutItem.style.width = '310px';
                            layoutItem.style.height = '120px';
                            layoutItem.style.marginBottom = `${gap}px`;
                        } else {
                            layoutItem.style.width = '70px';
                            layoutItem.style.height = '180px';
                        }
                        break;
                }

                // 添加删除按钮
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.addEventListener('click', function() {
                    const index = parseInt(layoutItem.dataset.index);
                    images.splice(index, 1);
                    updatePreview();
                });

                layoutItem.appendChild(removeBtn);

                // 添加拖拽事件
                layoutItem.setAttribute('draggable', 'true');
                layoutItem.addEventListener('dragstart', handleDragStart);
                layoutItem.addEventListener('dragover', handleDragOverItem);
                layoutItem.addEventListener('drop', handleDropItem);

                // 添加鼠标事件用于平移
                layoutItem.addEventListener('mousedown', handleMouseDown);

                layoutContainer.appendChild(layoutItem);
            }

            previewArea.appendChild(layoutContainer);
        } else {
            // 拼图模式
            const puzzleContainer = document.createElement('div');
            puzzleContainer.className = 'puzzle-container';
            puzzleContainer.classList.add(currentOrientation);
            puzzleContainer.style.gap = `${gap}px`;

            // 计算每个图片的尺寸
            let width = 200;
            let height = 200;

            if (currentOrientation === 'horizontal') {
                width = Math.min(200, 800 / images.length);
            } else {
                height = Math.min(200, 800 / images.length);
            }

            // 创建拼图项
            images.forEach((image, index) => {
                const puzzleItem = document.createElement('div');
                puzzleItem.className = 'puzzle-item';
                puzzleItem.style.backgroundImage = `url(${image})`;
                puzzleItem.style.width = `${width}px`;
                puzzleItem.style.height = `${height}px`;
                puzzleItem.style.borderRadius = `${borderRadius}px`;
                puzzleItem.style.border = `${borderWidth}px solid ${borderColor}`;
                puzzleItem.dataset.index = index;

                // 添加删除按钮
                const removeBtn = document.createElement('button');
                removeBtn.className = 'remove-btn';
                removeBtn.innerHTML = '<i class="fas fa-times"></i>';
                removeBtn.addEventListener('click', function() {
                    images.splice(index, 1);
                    updatePreview();
                });

                puzzleItem.appendChild(removeBtn);

                // 添加拖拽事件
                puzzleItem.setAttribute('draggable', 'true');
                puzzleItem.addEventListener('dragstart', handleDragStart);
                puzzleItem.addEventListener('dragover', handleDragOverItem);
                puzzleItem.addEventListener('drop', handleDropItem);

                // 添加鼠标事件用于平移
                puzzleItem.addEventListener('mousedown', handleMouseDown);

                puzzleContainer.appendChild(puzzleItem);
            });

            previewArea.appendChild(puzzleContainer);
        }
    }

    // 拖拽相关函数
    function handleDragStart(e) {
        draggedItem = e.target;
        e.dataTransfer.setData('text/plain', draggedItem.dataset.index);
        setTimeout(() => {
            draggedItem.style.opacity = '0.5';
        }, 0);
    }

    function handleDragOverItem(e) {
        e.preventDefault();
        e.target.style.borderColor = '#3498db';
    }

    function handleDropItem(e) {
        e.preventDefault();
        e.target.style.borderColor = '';

        const draggedIndex = parseInt(e.dataTransfer.getData('text/plain'));
        const targetIndex = parseInt(e.target.dataset.index);

        if (draggedIndex !== targetIndex) {
            // 交换图片
            [images[draggedIndex], images[targetIndex]] = [images[targetIndex], images[draggedIndex]];
            updatePreview();
        }

        draggedItem.style.opacity = '1';
        draggedItem = null;
    }

    // 鼠标事件处理（平移图片）
    function handleMouseDown(e) {
        if (!isAltPressed) return;

        const target = e.target.closest('.layout-item, .puzzle-item');
        if (!target) return;

        e.preventDefault();

        startX = e.clientX;
        startY = e.clientY;

        // 获取当前背景位置
        const backgroundPosition = target.style.backgroundPosition || 'center';
        const [posX, posY] = backgroundPosition.split(' ').map(coord => {
            if (coord === 'center') return 50;
            if (coord.endsWith('%')) return parseInt(coord);
            return 50;
        });

        offsetX = posX;
        offsetY = posY;

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    }

    function handleMouseMove(e) {
        if (!isAltPressed) return;

        const target = document.querySelector('.layout-item:hover, .puzzle-item:hover');
        if (!target) return;

        const dx = (e.clientX - startX) / 10;
        const dy = (e.clientY - startY) / 10;

        let newX = offsetX + dx;
        let newY = offsetY + dy;

        // 限制在0-100%范围内
        newX = Math.max(0, Math.min(100, newX));
        newY = Math.max(0, Math.min(100, newY));

        target.style.backgroundPosition = `${newX}% ${newY}%`;
    }

    function handleMouseUp() {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    }

    // 键盘事件处理
    function handleKeyDown(e) {
        if (e.key === 'Alt') {
            isAltPressed = true;
            document.body.style.cursor = 'move';
        }

        // 方向键平移图片
        if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
            const activeItem = document.querySelector('.layout-item:hover, .puzzle-item:hover');
            if (!activeItem) return;

            e.preventDefault();

            // 获取当前背景位置
            const backgroundPosition = activeItem.style.backgroundPosition || 'center';
            const [posX, posY] = backgroundPosition.split(' ').map(coord => {
                if (coord === 'center') return 50;
                if (coord.endsWith('%')) return parseInt(coord);
                return 50;
            });

            let newX = posX;
            let newY = posY;

            // 根据方向键调整位置
            switch (e.key) {
                case 'ArrowUp':
                    newY -= 2;
                    break;
                case 'ArrowDown':
                    newY += 2;
                    break;
                case 'ArrowLeft':
                    newX -= 2;
                    break;
                case 'ArrowRight':
                    newX += 2;
                    break;
            }

            // 限制在0-100%范围内
            newX = Math.max(0, Math.min(100, newX));
            newY = Math.max(0, Math.min(100, newY));

            activeItem.style.backgroundPosition = `${newX}% ${newY}%`;
        }
    }

    function handleKeyUp(e) {
        if (e.key === 'Alt') {
            isAltPressed = false;
            document.body.style.cursor = 'default';
        }
    }

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

        // 创建canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // 计算canvas尺寸
        let width, height;
        const gap = parseInt(gapInput.value) || 0;

        // 获取高级设置值
        const bgColor = document.getElementById('bgColor').value;
        const exportFormat = document.getElementById('exportFormat').value;
        const exportQuality = parseFloat(document.getElementById('exportQuality').value);
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

        canvas.width = width;
        canvas.height = height;

        // 绘制背景
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, width, height);

        // 绘制图片
        if (currentMode === 'layout') {
            let x = 0;
            let y = 0;
            const itemCount = Math.min(images.length, getLayoutItemCount(currentLayout));

            for (let i = 0; i < itemCount; i++) {
                let itemWidth, itemHeight;

                // 根据布局设置尺寸
                switch (currentLayout) {
                    case '2h':
                    case '2v':
                        itemWidth = 150;
                        itemHeight = 150;
                        break;
                    case '3h':
                    case '3v':
                        itemWidth = 100;
                        itemHeight = 100;
                        break;
                    case '3m':
                        if (i === 0) {
                            itemWidth = 310;
                            itemHeight = 150;
                        } else {
                            itemWidth = 150;
                            itemHeight = 150;
                        }
                        break;
                    case '4h':
                    case '4v':
                        itemWidth = 75;
                        itemHeight = 75;
                        break;
                    case '4g':
                        itemWidth = 150;
                        itemHeight = 150;
                        break;
                    case '4m':
                        if (i === 0) {
                            itemWidth = 230;
                            itemHeight = 310;
                        } else {
                            itemWidth = 70;
                            itemHeight = 100;
                        }
                        break;
                    case '5m':
                        if (i === 0) {
                            itemWidth = 310;
                            itemHeight = 120;
                        } else {
                            itemWidth = 70;
                            itemHeight = 180;
                        }
                        break;
                }

                // 加载并绘制图片
                const img = new Image();
                img.src = images[i];
                img.onload = function() {
                    ctx.drawImage(img, x, y, itemWidth, itemHeight);
                };

                // 更新位置
                if (currentLayout === '2h' || currentLayout === '3h' || currentLayout === '4h') {
                    x += itemWidth + gap;
                } else if (currentLayout === '2v' || currentLayout === '3v' || currentLayout === '4v') {
                    y += itemHeight + gap;
                } else if (currentLayout === '3m') {
                    if (i === 0) {
                        y += itemHeight + gap;
                        x = 0;
                    } else if (i === 1) {
                        x += itemWidth + gap;
                    }
                } else if (currentLayout === '4g') {
                    if ((i + 1) % 2 === 0) {
                        x = 0;
                        y += itemHeight + gap;
                    } else {
                        x += itemWidth + gap;
                    }
                } else if (currentLayout === '4m') {
                    if (i === 0) {
                        x += itemWidth + gap;
                    } else if ((i) % 3 === 0) {
                        x = 230 + gap;
                        y += itemHeight + gap;
                    } else {
                        x += itemWidth + gap;
                    }
                } else if (currentLayout === '5m') {
                    if (i === 0) {
                        y += itemHeight + gap;
                        x = 0;
                    } else {
                        x += itemWidth + gap;
                    }
                }
            }
        } else {
            // 拼图模式
            let x = 0;
            let y = 0;
            const itemCount = images.length;
            let itemWidth, itemHeight;

            if (currentOrientation === 'horizontal') {
                itemWidth = Math.min(200, 800 / itemCount);
                itemHeight = 200;
            } else {
                itemWidth = 200;
                itemHeight = Math.min(200, 800 / itemCount);
            }

            for (let i = 0; i < itemCount; i++) {
                // 加载并绘制图片
                const img = new Image();
                img.src = images[i];
                img.onload = function() {
                    ctx.drawImage(img, x, y, itemWidth, itemHeight);
                };

                // 更新位置
                if (currentOrientation === 'horizontal') {
                    x += itemWidth + gap;
                } else {
                    y += itemHeight + gap;
                }
            }
        }

        // 延迟下载，确保图片绘制完成
        setTimeout(() => {
            // 添加水印
            if (watermarkText) {
                ctx.save();
                ctx.globalAlpha = watermarkOpacity;
                ctx.fillStyle = watermarkColor;
                ctx.font = '20px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                let x, y;
                switch (watermarkPosition) {
                    case 'top-left':
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'top';
                        x = 10;
                        y = 10;
                        break;
                    case 'top-right':
                        ctx.textAlign = 'right';
                        ctx.textBaseline = 'top';
                        x = width - 10;
                        y = 10;
                        break;
                    case 'bottom-left':
                        ctx.textAlign = 'left';
                        ctx.textBaseline = 'bottom';
                        x = 10;
                        y = height - 10;
                        break;
                    case 'bottom-right':
                        ctx.textAlign = 'right';
                        ctx.textBaseline = 'bottom';
                        x = width - 10;
                        y = height - 10;
                        break;
                    case 'center':
                    default:
                        x = width / 2;
                        y = height / 2;
                }

                ctx.fillText(watermarkText, x, y);
                ctx.restore();
            }

            // 创建下载链接
            const link = document.createElement('a');
            let fileName = '拼图结果.' + exportFormat;
            let dataUrl;

            if (exportFormat === 'jpeg') {
                dataUrl = canvas.toDataURL('image/jpeg', exportQuality);
                console.log('导出JPEG格式，质量:', exportQuality);
            } else {
                dataUrl = canvas.toDataURL('image/png');
                console.log('导出PNG格式');
            }

            link.download = fileName;
            link.href = dataUrl;
            link.click();
        }, 1000);
    }

    // 获取布局的项目数量
    function getLayoutItemCount(layout) {
        switch (layout) {
            case '2h':
            case '2v':
                return 2;
            case '3h':
            case '3v':
            case '3m':
                return 3;
            case '4h':
            case '4v':
            case '4g':
            case '4m':
                return 4;
            case '5m':
                return 5;
            default:
                return 2;
        }
    }

    // 重置应用
    function resetApp() {
        images = [];
        currentLayout = null;
        templateItems.forEach(t => t.classList.remove('active'));
        fileInput.value = '';
        updatePreview();
    }
});

function init() {
    // 保存对话框相关元素
    const saveDialog = document.getElementById('saveDialog');
    const closeModal = document.querySelector('.close-modal');
    const downloadBtn = document.getElementById('downloadBtn');
    const saveBtn = document.getElementById('saveBtn');
    const saveAsBtn = document.getElementById('saveAsBtn');
    const pathBtns = document.querySelectorAll('.path-btn');
    const currentPath = document.getElementById('currentPath');
    const changePathBtn = document.getElementById('changePathBtn');
    const fileNameInput = document.getElementById('fileName');
    const saveFormat = document.getElementById('saveFormat');
    const qualityTabs = document.querySelectorAll('.quality-tab');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const estimatedSize = document.getElementById('estimatedSize');
    
    // 打开保存对话框
    downloadBtn.addEventListener('click', function() {
        if (images.length === 0) {
            alert('请先上传图片');
            return;
        }
        saveDialog.style.display = 'block';
        fileNameInput.value = '拼图结果';
        updateEstimatedSize();
    });
    
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
        // 这里可以实现打开文件浏览器选择路径的功能
        // 由于浏览器限制，实际应用中可能需要使用特定API或后端支持
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
        // 实际应用中可以实现另存为功能
        saveImage();
        saveDialog.style.display = 'none';
    });
    
    // 更新预估大小
    function updateEstimatedSize() {
        // 这里是模拟的预估大小计算
        const quality = parseInt(qualitySlider.value);
        // 假设基础大小为100KB，质量每降低10%，大小减少15%
        const baseSize = 100;
        const sizeReduction = (100 - quality) / 10 * 0.15;
        const estimated = baseSize * (1 - sizeReduction);
        estimatedSize.textContent = estimated.toFixed(2) + ' KB';
    }
}

// 修改下载图片函数
function saveImage() {
    // ... 现有绘制代码 ...
    
    // 延迟下载，确保图片绘制完成
    setTimeout(() => {
        // 添加水印
        if (watermarkText) {
            ctx.save();
            ctx.globalAlpha = watermarkOpacity;
            ctx.fillStyle = watermarkColor;
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
    
            let x, y;
            switch (watermarkPosition) {
                case 'top-left':
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'top';
                    x = 10;
                    y = 10;
                    break;
                case 'top-right':
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'top';
                    x = width - 10;
                    y = 10;
                    break;
                case 'bottom-left':
                    ctx.textAlign = 'left';
                    ctx.textBaseline = 'bottom';
                    x = 10;
                    y = height - 10;
                    break;
                case 'bottom-right':
                    ctx.textAlign = 'right';
                    ctx.textBaseline = 'bottom';
                    x = width - 10;
                    y = height - 10;
                    break;
                case 'center':
                default:
                    x = width / 2;
                    y = height / 2;
            }
    
            ctx.fillText(watermarkText, x, y);
            ctx.restore();
        }
    
        // 创建下载链接
        const link = document.createElement('a');
        let fileName = document.getElementById('fileName').value;
        const format = document.getElementById('saveFormat').value;
        const quality = parseInt(document.getElementById('qualitySlider').value) / 100;
        
        // 创建下载链接
        const link = document.createElement('a');
        let dataUrl;
        
        if (format === 'jpg') {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
            console.log('导出JPEG格式，质量:', quality);
        } else {
            dataUrl = canvas.toDataURL('image/png');
            console.log('导出PNG格式');
        }
        
        link.download = fileName + '.' + format;
        link.href = dataUrl;
        link.click();
    }, 1000);
}