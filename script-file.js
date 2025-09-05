// 文件处理模块

// 处理文件选择
function handleFileSelect(e) {
    const files = e.target.files;
    if (files && files.length > 0) {
        processFiles(files);
    }
}

// 处理拖放
function handleDragOver(e) {
    e.preventDefault();
    // 为拖放区域和预览区域添加视觉反馈
    if (elements.dropZone) {
        elements.dropZone.style.borderColor = '#3498db';
        elements.dropZone.style.backgroundColor = '#f8f9fa';
    }
    if (elements.previewArea) {
        elements.previewArea.style.borderColor = '#3498db';
        elements.previewArea.style.backgroundColor = 'rgba(52, 152, 219, 0.1)';
    }
}

function handleDragLeave(e) {
    // 恢复拖放区域和预览区域的样式
    if (elements.dropZone) {
        elements.dropZone.style.borderColor = '#ccc';
        elements.dropZone.style.backgroundColor = 'transparent';
    }
    if (elements.previewArea) {
        elements.previewArea.style.borderColor = 'transparent';
        elements.previewArea.style.backgroundColor = 'transparent';
    }
}

function handleDrop(e) {
    e.preventDefault();
    if (elements.dropZone) {
        elements.dropZone.style.borderColor = '#ccc';
        elements.dropZone.style.backgroundColor = 'transparent';
    }

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
        processFiles(files);
    }
}

// 处理文件 - 添加错误处理
function processFiles(files) {
    // 限制最大图片数量
    const maxImages = 10;
    const filesToProcess = Array.from(files).filter(file => file.type.match('image.*')).slice(0, maxImages);
    const totalFiles = filesToProcess.length;
    let processedCount = 0;
    let successfulCount = 0;
    let failedCount = 0;

    if (filesToProcess.length === 0) {
        alert('请选择有效的图片文件');
        return;
    }

    // 查找并移除旧的加载指示器
    const oldLoadingIndicator = document.querySelector('.loading-indicator');
    if (oldLoadingIndicator) {
        oldLoadingIndicator.parentNode.removeChild(oldLoadingIndicator);
    }

    // 创建新的加载指示器
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading-indicator';
    loadingIndicator.innerHTML = '<div class="loading-spinner"></div><span>正在加载图片... (0/' + totalFiles + ')</span>';
    if (elements.previewArea) {
        elements.previewArea.innerHTML = '';
        elements.previewArea.appendChild(loadingIndicator);
    }

    filesToProcess.forEach(file => {
        const reader = new FileReader();

        reader.onload = function(e) {
            images.push(e.target.result);
            processedCount++;
            successfulCount++;
            updateLoadingIndicator();

            if (processedCount === totalFiles) {
                setTimeout(() => {
                    if (loadingIndicator && loadingIndicator.parentNode) {
                        loadingIndicator.parentNode.removeChild(loadingIndicator);
                    }
                    // 确保updatePreview函数可用
                    if (window.updatePreview) {
                        window.updatePreview();
                    } else {
                        console.error('updatePreview函数未定义');
                    }
                }, 500); // 短暂延迟以便用户看到加载完成
            }
        };

        reader.onerror = function() {
            console.error('图片加载失败:', file.name);
            processedCount++;
            failedCount++;
            updateLoadingIndicator();

            if (processedCount === totalFiles) {
                setTimeout(() => {
                    if (loadingIndicator && loadingIndicator.parentNode) {
                        loadingIndicator.parentNode.removeChild(loadingIndicator);
                    }
                    // 确保updatePreview函数可用
                    if (window.updatePreview) {
                        window.updatePreview();
                    } else {
                        console.error('updatePreview函数未定义');
                    }
                    if (failedCount > 0) {
                        alert('有 ' + failedCount + ' 张图片加载失败');
                    }
                }, 500);
            }
        };

        reader.readAsDataURL(file);
    });

    function updateLoadingIndicator() {
        if (loadingIndicator) {
            loadingIndicator.querySelector('span').textContent = '正在加载图片... (' + processedCount + '/' + totalFiles + ')';
        }
    }
}

// 在文件末尾添加
// 确保关键函数在全局作用域可用
window.processFiles = processFiles;
window.handleFileSelect = handleFileSelect;
window.handleDragOver = handleDragOver;
window.handleDragLeave = handleDragLeave;
window.handleDrop = handleDrop;

// 确保全局变量可访问
window.images = window.images || [];