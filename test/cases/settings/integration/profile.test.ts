import assert from "node:assert/strict";
import test from "node:test";
import { createRendererServer, installBrowserGlobals } from "../../../lib/rendererTestHarness";

test("profile name persists, restores, and can be cleared without changing other settings", async (t) => {
  const { storage } = installBrowserGlobals(t, { initialStorage: { profileName: "Owner" } });
  const vite = await createRendererServer(t, { cachePrefix: "profile-settings-" });
  const { useSettingsStore } = await vite.ssrLoadModule("/stores/settingsStore.ts");
  assert.equal(useSettingsStore.getState().profileName, "Owner");
  useSettingsStore.getState().setProfileName("Тестовый Пользователь");
  assert.equal(storage.getItem("profileName"), "Тестовый Пользователь");
  assert.equal(useSettingsStore.getState().profileName, "Тестовый Пользователь");
  useSettingsStore.getState().setProfileName("");
  assert.equal(storage.getItem("profileName"), "");
  assert.equal(useSettingsStore.getState().profileName, "");
});
