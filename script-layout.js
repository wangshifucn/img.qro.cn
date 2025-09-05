// 布局和拼图模块

// 切换模式
function switchMode(mode) {
    currentMode = mode;

    if (mode === 'layout') {
        elements.layoutModeBtn.classList.add('active');
        elements.puzzleModeBtn.classList.remove('active');
        elements.layoutTemplates.style.display = 'block';
        elements.puzzleOrientation.style.display = 'none';
    } else {
        elements.layoutModeBtn.classList.remove('active');
        elements.puzzleModeBtn.classList.add('active');
        elements.layoutTemplates.style.display = 'none';
        elements.puzzleOrientation.style.display = 'block';
    }

    updatePreview();
}

// 设置拼图方向
function setOrientation(orientation) {
    currentOrientation = orientation;

    if (orientation === 'horizontal') {
        elements.horizontalBtn.classList.add('active');
        elements.verticalBtn.classList.remove('active');
    } else {
        elements.horizontalBtn.classList.remove('active');
        elements.verticalBtn.classList.add('active');
    }

    updatePreview();
}

// 选择模板
function selectTemplate(e) {
    const template = e.currentTarget;
    currentLayout = template.dataset.layout;

    // 更新模板选中状态
    elements.templateItems.forEach(t => t.classList.remove('active'));
    template.classList.add('active');

    updatePreview();
}

// 更新预览 - 优化版本，减少不必要的DOM重建
function updatePreview() {
    if (!elements.previewArea) return;
    
    const gap = parseInt(elements.gapInput.value) || 0;
    const borderRadius = parseInt(elements.borderRadiusInput.value) || 0;
    const borderColor = elements.borderColorInput.value;
    const borderWidth = parseInt(elements.borderWidthInput.value) || 0;

    elements.previewArea.innerHTML = '';

    if (currentMode === 'layout') {
        if (!currentLayout) {
            elements.previewArea.innerHTML = '<p class="placeholder">请选择布局模板</p>';
            return;
        }

        // 创建布局容器
        const layoutContainer = document.createElement('div');
        layoutContainer.className = 'layout-container';
        layoutContainer.style.gap = `${gap}px`;

        // 根据布局模板创建布局项
        let itemCount = getLayoutItemCount(currentLayout);

        // 创建布局项（即使没有图片也创建占位项）
        for (let i = 0; i < itemCount; i++) {
            createLayoutItem(layoutContainer, i, gap, borderRadius, borderColor, borderWidth);
        }

        elements.previewArea.appendChild(layoutContainer);
    } else {
        // 拼图模式
        if (images.length === 0) {
            elements.previewArea.innerHTML = '<p class="placeholder">请上传图片</p>';
            return;
        }
        createPuzzlePreview(gap, borderRadius, borderColor, borderWidth);
    }
}

// 创建布局项
// 创建布局项
function createLayoutItem(container, index, gap, borderRadius, borderColor, borderWidth) {
    const layoutItem = document.createElement('div');
    layoutItem.className = 'layout-item';
    layoutItem.style.borderRadius = `${borderRadius}px`;
    layoutItem.style.border = `${borderWidth}px solid ${borderColor}`;
    layoutItem.dataset.index = index;
    layoutItem.style.backgroundSize = 'cover';
    layoutItem.style.backgroundPosition = 'center';
    layoutItem.style.position = 'relative';
    layoutItem.style.touchAction = 'none'; // 防止移动设备上的默认触摸行为

    // 如果有图片，则设置背景图片
    if (images.length > index) {
        layoutItem.style.backgroundImage = `url(${images[index]})`;
    } else {
        // 否则显示占位符
        layoutItem.style.backgroundColor = '#f0f0f0';
        layoutItem.style.display = 'flex';
        layoutItem.style.alignItems = 'center';
        layoutItem.style.justifyContent = 'center';
        layoutItem.style.color = '#999';
        layoutItem.innerHTML = `<i class="fas fa-image"></i>`;
    }

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
            if (index === 0) {
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
            if (index === 0) {
                layoutItem.style.width = '230px';
                layoutItem.style.height = '310px';
                layoutItem.style.marginRight = `${gap}px`;
            } else {
                layoutItem.style.width = '70px';
                layoutItem.style.height = '100px';
            }
            break;
        case '5m':
            if (index === 0) {
                layoutItem.style.width = '310px';
                layoutItem.style.height = '120px';
                layoutItem.style.marginBottom = `${gap}px`;
            } else {
                layoutItem.style.width = '70px';
                layoutItem.style.height = '180px';
            }
            break;
    }

    // 添加删除按钮 (只有当有图片时才添加)
    if (images.length > index) {
        addRemoveButton(layoutItem, index);
    }

    // 添加拖拽事件 - 交换位置
    addDragEvents(layoutItem);

    // 添加鼠标事件用于平移
    addMouseEvents(layoutItem);

    // 添加调整大小功能
    addResizeHandles(layoutItem);

    container.appendChild(layoutItem);
}

// 创建拼图预览
function createPuzzlePreview(gap, borderRadius, borderColor, borderWidth) {
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
        puzzleItem.style.backgroundSize = 'cover';
        puzzleItem.style.backgroundPosition = 'center';
        puzzleItem.style.position = 'relative';

        // 添加删除按钮
        addRemoveButton(puzzleItem, index);

        // 添加拖拽事件
        addDragEvents(puzzleItem);

        // 添加鼠标事件用于平移
        addMouseEvents(puzzleItem);

        // 添加调整大小功能
        addResizeHandles(puzzleItem);

        puzzleContainer.appendChild(puzzleItem);
    });

    elements.previewArea.appendChild(puzzleContainer);
}

// 添加调整大小的控制柄
function addResizeHandles(item) {
    // 右下角控制柄
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    resizeHandle.style.position = 'absolute';
    resizeHandle.style.bottom = '5px';
    resizeHandle.style.right = '5px';
    resizeHandle.style.width = '15px';
    resizeHandle.style.height = '15px';
    resizeHandle.style.backgroundColor = '#4338ca';
    resizeHandle.style.borderRadius = '50%';
    resizeHandle.style.cursor = 'se-resize';
    resizeHandle.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    resizeHandle.style.zIndex = '100';

    item.appendChild(resizeHandle);

    // 添加调整大小事件
    let isResizing = false;
    let startX, startY, startWidth, startHeight;

    resizeHandle.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = parseInt(getComputedStyle(item).width);
        startHeight = parseInt(getComputedStyle(item).height);

        // 添加事件监听器
        document.addEventListener('mousemove', onResizeMove);
        document.addEventListener('mouseup', onResizeEnd);

        // 防止拖动时选择文本
        document.body.style.userSelect = 'none';
    });

    function onResizeMove(e) {
        if (!isResizing) return;

        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        let newWidth = startWidth + dx;
        let newHeight = startHeight + dy;

        // 设置最小尺寸
        newWidth = Math.max(50, newWidth);
        newHeight = Math.max(50, newHeight);

        item.style.width = `${newWidth}px`;
        item.style.height = `${newHeight}px`;
    }

    function onResizeEnd() {
        isResizing = false;
        document.removeEventListener('mousemove', onResizeMove);
        document.removeEventListener('mouseup', onResizeEnd);
        document.body.style.userSelect = '';
    }
}

// 添加删除按钮
function addRemoveButton(item, index) {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'remove-btn';
    removeBtn.innerHTML = '<i class="fas fa-times"></i>';
    removeBtn.addEventListener('click', function() {
        // 从images数组中删除对应的图片
        images.splice(index, 1);
        // 确保updatePreview函数可用
        if (window.updatePreview) {
            window.updatePreview();
        } else {
            console.error('updatePreview函数未定义');
        }
    });

    // 鼠标悬停时显示删除按钮
    item.addEventListener('mouseenter', function() {
        removeBtn.style.display = 'flex';
    });

    item.addEventListener('mouseleave', function() {
        removeBtn.style.display = 'none';
    });

    item.appendChild(removeBtn);
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

// 添加拖拽事件 - 实现缺失的函数
function addDragEvents(item) {
    item.addEventListener('dragstart', function(e) {
        draggedItem = this;
        setTimeout(() => {
            this.style.opacity = '0.5';
        }, 0);
    });

    item.addEventListener('dragend', function() {
        this.style.opacity = '1';
        draggedItem = null;
    });

    item.addEventListener('dragover', function(e) {
        e.preventDefault();
    });

    item.addEventListener('drop', function(e) {
        e.preventDefault();
        if (draggedItem && draggedItem !== this) {
            // 交换图片
            const draggedIndex = parseInt(draggedItem.dataset.index);
            const thisIndex = parseInt(this.dataset.index);
            
            // 交换images数组中的图片
            [images[draggedIndex], images[thisIndex]] = [images[thisIndex], images[draggedIndex]];
            
            // 更新预览
            updatePreview();
        }
    });

    // 设置可拖拽
    item.setAttribute('draggable', true);
}

// 添加鼠标事件用于平移 - 实现缺失的函数
function addMouseEvents(item) {
    item.addEventListener('mousedown', function(e) {
        if (isAltPressed) {
            e.preventDefault();
            startX = e.clientX;
            startY = e.clientY;
            
            // 获取当前背景位置
            const bgPosition = getComputedStyle(this).backgroundPosition.split(' ');
            offsetX = parseInt(bgPosition[0]) || 0;
            offsetY = parseInt(bgPosition[1]) || 0;
            
            // 添加移动事件监听器
            document.addEventListener('mousemove', onMouseMove);
            document.addEventListener('mouseup', onMouseUp);
        }
    });

    function onMouseMove(e) {
        e.preventDefault();
        if (!isAltPressed) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        // 更新背景位置
        item.style.backgroundPosition = `${offsetX + dx}px ${offsetY + dy}px`;
    }

    function onMouseUp() {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    }
}

// 确保updatePreview在全局作用域可用
window.updatePreview = updatePreview;