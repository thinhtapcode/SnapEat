# up database to docker
docker-compose up postgres mongodb redis -d   

# run backend
npm run dev --workspace=apps/backend          

# run ai-service
npm run ai:dev

# run frontend
npm run web:dev

# view database
npm run prisma:studio --workspace=apps/backend
