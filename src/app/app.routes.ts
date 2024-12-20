import { Routes } from '@angular/router';
import { ArticleDetailComponent } from './article-details/article-details.component';
import { MainPageComponent } from './main-page/main-page.component';
import { ArticleCreateComponent } from './article-form/article-form.component';
import { EditArticleComponent } from './edit-article/edit-article.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
    { path: 'articles', component: MainPageComponent },
    { path: 'login', component: LoginComponent },
    { path: 'article/:id', component: ArticleDetailComponent },  
    { path: 'article/new/form', component: ArticleCreateComponent  }, 
    { path: '', redirectTo: 'login', pathMatch: 'full' },    
    { path: 'edit/:id', component: EditArticleComponent },
];
