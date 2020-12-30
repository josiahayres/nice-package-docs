import Head from "next/head";
import styles from "../styles/Home.module.css";

// @refresh reset
export default function Startup() {
	return (
		<div className={styles.container}>
			<Head>
				<title>package-docs</title>
				<link rel="icon" href="/favicon.ico" />
			</Head>

			<main className={styles.main}>
				<h1 className={styles.title}>package-docs</h1>

				<p className={styles.description}>
					Select a package.json file to get started
				</p>

				<label>Pick File</label>
				<form>
					<input
						onChange={(event) => {
							//@source: https://web.dev/read-files/
							if (event?.target?.files?.length < 1) return;

							const file = event.target.files[0];
							const reader = new FileReader();

							reader.addEventListener("load", (event) => {
								// TS complains that
								// @ts-ignore
								const packageJson = JSON.parse(reader.result); // Parse the result into an object

								const {
									name,
									version,
									dependencies,
									devDependencies,
								} = packageJson;
								console.log(`Selected: ${name} (${version})`);

								const dependenciesList = Object.entries(
									dependencies
								);
								console.log(dependenciesList);
								// Do something with result
							});

							reader.addEventListener("progress", (event) => {
								if (event.loaded && event.total) {
									const percent =
										(event.loaded / event.total) * 100;
									console.log(
										`Progress: ${Math.round(percent)}`
									);
								}
							});

							reader.readAsText(file);
						}}
						type="file"
						aria-label="Select package json file"
						accept="application/JSON"
					></input>
					<input type="reset"></input>
				</form>
			</main>
		</div>
	);
}
