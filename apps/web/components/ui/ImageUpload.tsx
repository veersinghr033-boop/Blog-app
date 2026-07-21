import { Modal, Button } from "antd";

interface ImageUploadProps {
    isModalOpen: boolean;
    setIsModalOpen: (value: boolean) => void;
    avatarPreview: string;
    user: any;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    handleRemoveProfileImage: () => void;
    removeProfileImage: boolean;
}

function ImageUpload({
    isModalOpen,
    setIsModalOpen,
    avatarPreview,
    user,
    fileInputRef,
    handleRemoveProfileImage,
    removeProfileImage,
}: ImageUploadProps) {
    return (
        <Modal
            title="Update Profile Photo"
            open={isModalOpen}
            onCancel={() => setIsModalOpen(false)}
            footer={null}
            centered
        >
            <div className="flex flex-col items-center gap-6">
                {!removeProfileImage &&
                    (avatarPreview || user?.profileImage) ? (
                    <img
                        src={avatarPreview || user?.profileImage}
                        alt="profile"
                        className="w-36 h-36 rounded-full object-cover border"
                    />
                ) : (
                    <div className="w-36 h-36 rounded-full bg-gray-700 text-white flex items-center justify-center text-3xl">
                        ?
                    </div>
                )}

                <div className="flex gap-4">
                    <Button
                        danger
                        onClick={handleRemoveProfileImage}
                    >
                        Remove
                    </Button>

                    <Button
                        type="primary"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        Upload
                    </Button>
                </div>
            </div>
        </Modal>
    );
}

export default ImageUpload;