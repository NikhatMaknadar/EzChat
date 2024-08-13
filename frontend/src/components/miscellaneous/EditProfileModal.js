import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Button,
    useDisclosure,
    Input,
    FormLabel,
} from "@chakra-ui/react";
import { useState } from "react";
import { useToast } from "@chakra-ui/toast";
import axios from "axios";
import { ChatState } from "../../Context/ChatProvider";

const EditProfileModal = () => {
    const { user, setUser } = ChatState();
    const toast = useToast();
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [name, setName] = useState(user.name); // Initialize with user's name
    const [pic, setPic] = useState();
    const oldPic = user.pic;


    const handleUpdate = async () => {
        if (name == null) {
            setName(user.name); // Use existing name if no new name is provided
        }
        if (pic == null) {
            setPic(oldPic); // Use existing picture if no new picture is provided
        }

        try {
            const config = {
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
            };

            // Send the request to update profile
            const { data } = await axios.put(
                `/api/user/updateProfile`,
                {
                    userId: user._id,
                    name: name,
                    pic: pic,
                },
                config
            );

            // Update the local user state
            setUser(data);
            // Update local storage with the new user data
            localStorage.setItem('userInfo', JSON.stringify(data));
            // Show success message
            toast({
                title: "Successful",
                description: "Updated Successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        } catch (error) {
            toast({
                title: "Error Occurred!",
                description: "Failed to update profile",
                status: "error",
                duration: 5000,
                isClosable: true,
                position: "bottom-left",
            });
        }

        onClose(); // Close the modal after saving
    };



    const postDetails = (pics) => {

        // Check if no image is selected
        if (pics === undefined) {
            toast({
                title: "Please Select an Image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
            return;
        }

        // Check if the image type is valid
        if (pics.type === "image/jpeg" || pics.type === "image/png") {
            const data = new FormData();
            data.append("file", pics);
            data.append("upload_preset", "chat-app");
            data.append("cloud_name", "nikhat");

            // Function to delete the old image from Cloudinary
            const deleteOldImage = () => {
                const publicId = oldPic.split("/").pop().split(".")[0]; // Extracting public ID from the URL
                fetch(`https://api.cloudinary.com/v1_1/nikhat/image/destroy`, {
                    method: "POST",
                    body: JSON.stringify({ public_id: publicId })
                })
                    .then((res) => res.json())
                    .then(() => {
                        uploadNewImage(); // Call the upload function after deletion
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            };

            // Function to upload the new image
            const uploadNewImage = () => {
                fetch("https://api.cloudinary.com/v1_1/nikhat/image/upload", {
                    method: "POST",
                    body: data,
                })
                    .then((res) => res.json())
                    .then((data) => {
                        setPic(data.url.toString());
                        console.log(data.url.toString());
                    })
                    .catch((err) => {
                        console.log(err);
                    });
            };

            // Start the deletion process
            deleteOldImage();
        } else {
            toast({
                title: "Please Select a Valid Image!",
                status: "warning",
                duration: 5000,
                isClosable: true,
                position: "bottom",
            });
        }
    };

    return (
        <>
            <Button onClick={onOpen} colorScheme="blue" mr={3}>
                Edit Profile
            </Button>
            <Modal size="lg" onClose={onClose} isOpen={isOpen} isCentered>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Edit Profile</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormLabel>Name</FormLabel>
                        <Input
                            placeholder="Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            mb={3}
                        />
                        <FormLabel>Profile Picture</FormLabel>
                        <Input
                            type="file"
                            p={1.5}
                            accept="image/*"
                            onChange={(e) => postDetails(e.target.files[0])}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" onClick={handleUpdate}>
                            Update
                        </Button>
                        <Button onClick={onClose} ml={3}>
                            Cancel
                        </Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </>
    );
};

export default EditProfileModal;
