// 交互功能模块

// 添加拖拽事件
function addDragEvents(item) {
    item.setAttribute('draggable', 'true');
    item.addEventListener('dragstart', handleDragStart);
}

// 添加鼠标事件
function addMouseEvents(item) {
    item.addEventListener('mousedown', handleMouseDown);
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

// 为预览区域添加拖放目标事件
document.addEventListener('DOMContentLoaded', function() {
    document.addEventListener('dragover', function(e) {
        const target = e.target.closest('.layout-item, .puzzle-item');
        if (target) {
            e.preventDefault();
            target.style.borderColor = '#3498db';
        }
    });

    document.addEventListener('drop', function(e) {
        const target = e.target.closest('.layout-item, .puzzle-item');
        if (target && draggedItem) {
            e.preventDefault();
            target.style.borderColor = '';

            const draggedIndex = parseInt(draggedItem.dataset.index);
            const targetIndex = parseInt(target.dataset.index);

            if (draggedIndex !== targetIndex) {
                // 交换图片
                [images[draggedIndex], images[targetIndex]] = [images[targetIndex], images[draggedIndex]];
                updatePreview();
            }

            draggedItem.style.opacity = '1';
            draggedItem = null;
        }
    });
});
// 移除重复的函数定义，确保只在script-layout.js中定义一次
// 这个文件可以留空或只保留必要的代码