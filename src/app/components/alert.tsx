import React, {useEffect, useState} from 'react';

interface AlertProps {
    message: string;
    onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({message, onClose}) => {
    const [isVisible, setIsVisible] = useState(true);

    // 모달이 나타날 때 애니메이션 효과
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300); // 모달이 사라지는 시간을 고려하여 닫기 함수 호출
        }, 3000); // 모달이 3초 후에 자동으로 닫히도록 설정

        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
            <div className={`bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-md p-4 max-w-sm w-full transition-transform transform ${isVisible ? 'scale-100' : 'scale-95'} duration-300`}>
                <p className="text-black dark:text-white">{message}</p>
                <button
                    onClick={onClose}
                    className="mt-4 custom-btn">
                    닫기
                </button>
            </div>
        </div>
    );
};

export default Alert;