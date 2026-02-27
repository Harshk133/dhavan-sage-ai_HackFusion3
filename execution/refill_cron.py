import asyncio
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from execution.predict_refills import predict_refills

scheduler = AsyncIOScheduler()

def start_scheduler():
    # Run the refill predictor every hour (or minutely for hackathon demo)
    scheduler.add_job(predict_refills, 'interval', minutes=1, id='refill_job')
    scheduler.start()
    print("Background job scheduler started.")
