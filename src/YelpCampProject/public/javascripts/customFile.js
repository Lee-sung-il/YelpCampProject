const realInput = document.getElementById('customFile');
const fakeInput = document.getElementById('fileDisplay');
const browseBtn = document.getElementById('browseBtn');

// 버튼 클릭 시 실제 input 클릭
browseBtn.addEventListener('click', () => realInput.click());

// 파일 선택 시 input에 이름 또는 개수 표시
realInput.addEventListener('change', () => {
    const files = realInput.files;
    if (files.length === 0) {
        fakeInput.value = 'No file chosen';
    } else if (files.length === 1) {
        fakeInput.value = files[0].name;
    } else {
        fakeInput.value = `${ Array.from(files).map(file => file.name).join(', ')}`;
    }
});