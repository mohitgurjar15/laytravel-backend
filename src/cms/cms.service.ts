import { Injectable, NotFoundException } from '@nestjs/common';
import { CmsRepository } from './cms.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { UpdateCmsDto } from './dto/update-cms.dto';
import { Cms } from 'src/entity/cms.entity';
import { User } from 'src/entity/user.entity';
import { Activity } from 'src/utility/activity.utility';

@Injectable()
export class CmsService {

    constructor(
        @InjectRepository(CmsRepository)
        private cmsRepository: CmsRepository
    ) {

    }

    async createCmsPage(updateCmsDto: UpdateCmsDto, user: User) {

        const {
            page_type,
            title, en_content, es_content, it_content, de_content, fr_content

        } = updateCmsDto;

        let iscmsPageExist = await this.cmsRepository.findOne({
            pageType: page_type
        });

        if (iscmsPageExist)
            throw new NotFoundException(`Page type already exist`);

        let cmsPage = new Cms();
        cmsPage.pageType = page_type;
        cmsPage.title = title;
        cmsPage.enContent = en_content;
        cmsPage.esContent = es_content;
        cmsPage.itContent = it_content;
        cmsPage.deContent = de_content;
        cmsPage.frContent = fr_content;

        // await this.cmsRepository.update({ pageType:page_type},cmsPage);
        await cmsPage.save();
        Activity.logActivity(user.userId, "cms", `${cmsPage.title} is created by ${user.email}`);
        return { messge: `Cms page added successfully` };
    }



    async updateCmsPage(updateCmsDto: UpdateCmsDto, user: User): Promise<Cms> {

        const {
            page_type,
            title, en_content, es_content, it_content, de_content, fr_content

        } = updateCmsDto;

        let iscmsPageExist = await this.cmsRepository.findOne({
            pageType: page_type
        });

        
        if (!iscmsPageExist)
            throw new NotFoundException(`Cms page not found`);
            const previousValue = JSON.stringify(iscmsPageExist)
        let cmsPage = new Cms();
        cmsPage.pageType = page_type;
        cmsPage.title = title;
        cmsPage.enContent = en_content;
        cmsPage.esContent = es_content;
        cmsPage.itContent = it_content;
        cmsPage.deContent = de_content;
        cmsPage.frContent = fr_content;

        await this.cmsRepository.update({ pageType: page_type }, cmsPage);
        Activity.logActivity(user.userId, "cms", `${cmsPage.title} is updated by ${user.email}`, previousValue,JSON.stringify(cmsPage));
        return cmsPage;
    }

    async listCmsPage(): Promise<Cms[]> {

        const cmsPages = await this.cmsRepository.find({
            where: { isDeleted: false },
            order: { id: 'DESC' }
        });
        if (cmsPages.length)
            return cmsPages
        else
            throw new NotFoundException(`Cms page not found`)
    }

    async cmsPageDetails(pageType): Promise<Cms> {

        let pageDetails = await this.cmsRepository.findOne({
            pageType,
            isDeleted: false
        })
        if (!pageDetails) {
            throw new NotFoundException(`Cms page not found`)
        }

        return pageDetails;
    }
}
