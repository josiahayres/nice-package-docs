import Head from "next/head";
import { useReducer, useCallback } from "react";
import Dropzone from "react-dropzone";
import styles from "../styles/Home.module.css";

const packageLocal = require("../package.json");

// @refresh reset

interface IPackage {
	name: string;
	version?: string;
	dependencies?: any[];
	devDependencies?: any[];
}
interface IPackageFormatted extends IPackage {
	dependenciesList?: any[];
	devDependenciesList?: any[];
}
interface IReducer {
	loaded: boolean;
	packageJson?: IPackageFormatted;
	file?: File | undefined;
	fileUploadProgress: number;
}

const initialState: IReducer = {
	loaded: false,
	packageJson: {
		name: "",
		version: "",
		dependenciesList: [],
		devDependenciesList: [],
	},
	file: undefined,
	fileUploadProgress: 0,
};

function reducer(state, action) {
	switch (action.type) {
		case "resetForm":
			return { ...initialState };
		case "fileLoaded":
			return { ...state, file: action.payload };
		case "jsonLoaded":
			return { ...state, loaded: true, packageJson: action.payload };
		case "setFileUploadProgress":
			return { ...state, fileUploadProgress: action.payload };

		default:
			throw new Error();
	}
}

function processPackageJson(file: IPackage): IPackageFormatted {
	return {
		...file,
		dependenciesList: Object.entries(file?.dependencies),
		devDependenciesList: Object.entries(file?.devDependencies),
	};
}

export default function Startup() {
	const [state, dispatch] = useReducer(reducer, initialState);
	const {
		loaded,
		fileUploadProgress,
		packageJson: { name, version, dependenciesList, devDependenciesList },
	} = state;
	const allDependencies = [...dependenciesList, ...devDependenciesList];

	const handleResetFormClicked = () => {
		dispatch({ type: "resetForm" });
	};

	const onDrop = useCallback((acceptedFiles) => {
		acceptedFiles.forEach((file) => {
			const reader = new FileReader();

			reader.onabort = () => console.log("file reading was aborted");
			reader.onerror = () => console.log("file reading has failed");
			reader.onload = () => {
				try {
					const fileText = reader.result.toString();
					const packageJson = JSON.parse(fileText); // Parse the result into an object

					const formattedPackage = processPackageJson(packageJson);

					dispatch({
						type: "jsonLoaded",
						payload: formattedPackage,
					});
				} catch (error) {
					console.error("Could not process file: ", error);
				}
			};
			reader.onprogress = (event) => {
				if (event.loaded && event.total) {
					const percentDone = (event.loaded / event.total) * 100;
					dispatch({
						type: "setFileUploadProgress",
						payload: percentDone,
					});
				}
			};

			reader.readAsText(file);
		});
	}, []);

	return (
		<Dropzone accept="application/JSON" onDropAccepted={onDrop}>
			{({ getRootProps, getInputProps }) => (
				<div {...getRootProps()}>
					<div className={styles.container}>
						<Head>
							<title>package-docs</title>
							<link rel="icon" href="/favicon.ico" />
						</Head>

						<main className={styles.main}>
							<h1 className={styles.title}>package-docs</h1>

							<input {...getInputProps()} />

							<p>{fileUploadProgress}</p>
							<p className={styles.description}>
								{!loaded
									? "Select a package.json file to get started"
									: "Selected package.json"}
							</p>

							{loaded && (
								<div>
									<h3>Details</h3>
									<p>{name}</p>
									<p>{version}</p>
									<h3>Dependencies</h3>
									<p>
										{`${
											dependenciesList.length +
											devDependenciesList.length
										} dependencies`}
									</p>
									<aside>
										<ol>
											{allDependencies.map(
												(dependency) => {
													const name = dependency[0];
													const version =
														dependency[1];
													return (
														<li>{`${name} ${version}`}</li>
													);
												}
											)}
										</ol>
									</aside>
								</div>
							)}
						</main>
					</div>
				</div>
			)}
		</Dropzone>
	);
}
