import { DashboardTextHeading } from "@/components/ui/dashboard-text-heading";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/shadcn-ui/card"

export default function page() {
    return (
        <>
            <DashboardTextHeading
                title="Comparison"
                description="Compare different runs and analyze their performance"
            />
            <Card>
                <CardHeader>
                    <CardTitle>Sélectionner des amis à comparer</CardTitle>
                    <CardDescription>
                        Liste des amis (4 membres)
                    </CardDescription>
                </CardHeader>
                <CardContent>

                </CardContent>
            </Card>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Distance</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle></CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Allure Moyenne</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Fréquence d&apos;Activité</CardTitle>
                    </CardHeader>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Tableau Comparatif</CardTitle>
                    <CardDescription>
                        Analyse comparative des membres sélectionnés
                    </CardDescription>
                </CardHeader>
                <CardContent>
                
                </CardContent>
            </Card>
        </>
    )
}
