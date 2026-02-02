import React, { useState } from "react";
import login from "../assests/login.jpg";

const PasswordInput = ({ label, placeholder, value, onChange }) => {
    return (
        <div className="mb-6">
            <label htmlFor={label.toLowerCase().replace(" ", "-")} className="block mb-2">
                {label}
            </label>
            <div className="flex gap-6 px-3.5 py-4 text-xs rounded-xl border border-black border-solid bg-zinc-50 text-neutral-400">
                <img
                    loading="lazy"
                    src="http://cdn.builder.io/api/v1/image/assets/TEMP/578e92bad370ed651ec7a72933d071e71fff57a3a886820783ec24907c355685?placeholderIfAbsent=true&apiKey=f4328c4a551b4b9fa165bba17dc932db"
                    alt=""
                    className="object-contain shrink-0 self-start w-3.5 aspect-square"
                />
                <input
                    type="password"
                    id={label.toLowerCase().replace(" ", "-")}
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    className="flex-auto w-[265px] bg-transparent border-none focus:outline-none"
                    aria-label={label}
                />
            </div>
        </div>
    );
};

const PasswordSetup = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
    };

    return (
        <div className="h-screen flex">
            <div className="w-1/2 flex justify-center items-center">
                <img src={login} alt="Login Illustration" className="object-cover h-[100%]" />
            </div>
            <main className="flex flex-col text-sm text-black rounded-none ml-[15%] mt-[10%] max-w-[330px]">
                <img loading="lazy"
                    src="http://cdn.builder.io/api/v1/image/assets/TEMP/047e41c687ca366cbdc17b6a91d100d2842916288fb5d4d3fe9daf7cc2e24482?placeholderIfAbsent=true&apiKey=f4328c4a551b4b9fa165bba17dc932db"
                    alt="" className="object-contain self-center aspect-square w-[45px]"
                />
                <h1 className="self-center mt-5 text-2xl font-semibold">
                    Set your password
                </h1>
                <p className="mt-1 text-base font-medium text-zinc-600">
                </p>
                <form onSubmit={handleSubmit} className="mt-[10%] ml-[10%]">
                    <PasswordInput
                        label="Password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <PasswordInput
                        label="Confirm password"
                        placeholder="Confirm password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-16 py-3.5 mt-6 w-full font-medium text-white whitespace-nowrap bg-blue-700 rounded-xl"
                    >
                        Continue
                    </button>
                </form>
            </main>
        </div>
    );
};
export default PasswordSetup;