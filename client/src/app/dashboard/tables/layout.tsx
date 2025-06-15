"use client";

import React from "react";
import styles from "./styles.module.css";
import { TableCreatorModal } from "@/features/dashboard/main/components/table-creator/table-creator";

export default function TablesLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<>
			<div className={styles.headerButtons}>
				<div className={styles.createTableButton}>
					<TableCreatorModal />
				</div>
			</div>
			<main className={styles.tablesContainer}>{children}</main>
		</>
	);
}
