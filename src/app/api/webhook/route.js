import { exec } from 'child_process';

export async function POST(req) {
    const payload = await req.json();

    console.log("🚀 Webhook received:", payload);

    exec('/root/PaarshEdu/Paarsh/deploy.sh', (err, stdout, stderr) => {
        if (err) {
            console.error(`Deployment Error: ${stderr}`);
            return new Response(stderr, { status: 500 });
        }
        console.log(`Deployment Success: ${stdout}`);
        return new Response(stdout, { status: 200 });
    });

    return new Response("Webhook received!", { status: 200 });
}
