
import SettingCard from "./setting"

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-semibold mb-6">Settings</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <SettingCard
        cardTitle={"Building Settings"}
        cardDescription={"Add or delete building (Input Building Name)"}
        buttonName={"Building"}
        drawerTitle={"Building"}
        drawerDescription={"Add or Delete."}
        entityType={"building"}
      />

      <SettingCard
        cardTitle={"Sensor Settings"}
        cardDescription={"Add or Delete Sensor (Input Building, then Sensor Name)"}
        buttonName={"Sensor"}
        drawerTitle={"Sensor"}
        drawerDescription={"Add or Delete."}
        entityType={"sensor"}
      />

      <SettingCard
        cardTitle={"Subscription Settings"}
        cardDescription={"Subscribe or Unsubscribe from Alert System"}
        buttonName={"Subscription"}
        drawerTitle={"Subscription"}
        drawerDescription={"Subscribe or Unsubscribe"}
        entityType={"subscriber"}
      />
      </div>
    </div>
  )
}

